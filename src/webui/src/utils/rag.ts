/**
 * Basic RAG (Retrieval-Augmented Generation) utilities
 * Provides document storage, indexing, and retrieval functionality
 */

export interface Document {
  id: string;
  title: string;
  content: string;
  embedding?: number[];
  metadata?: {
    source?: string;
    type?: string;
    timestamp?: number;
    size?: number;
  };
}

export interface RAGConfig {
  maxDocuments: number;
  chunkSize: number;
  chunkOverlap: number;
  similarityThreshold: number;
  maxRetrievedDocs: number;
}

export const DEFAULT_RAG_CONFIG: RAGConfig = {
  maxDocuments: 1000,
  chunkSize: 1000,
  chunkOverlap: 200,
  similarityThreshold: 0.5,
  maxRetrievedDocs: 5,
};

/**
 * Simple text chunking function
 */
export function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    
    if (end === text.length) break;
    start = end - overlap;
  }
  
  return chunks;
}

/**
 * Simple BM25-like scoring for text similarity
 * This is a basic implementation - in production you'd use proper embeddings
 */
export function calculateSimpleSimilarity(query: string, document: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const docTerms = document.toLowerCase().split(/\s+/);
  const docTermSet = new Set(docTerms);
  
  let matches = 0;
  for (const term of queryTerms) {
    if (docTermSet.has(term)) {
      matches++;
    }
  }
  
  return queryTerms.length > 0 ? matches / queryTerms.length : 0;
}

/**
 * Generate a simple hash-based embedding (placeholder for real embeddings)
 * In a real implementation, you'd use a proper embedding model
 */
export function generateSimpleEmbedding(text: string): number[] {
  const embedding = new Array(100).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
    }
    const index = Math.abs(hash) % embedding.length;
    embedding[index] += 1;
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return (normA * normB) > 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

/**
 * RAG Document Store - manages documents and retrieval
 */
export class RAGStore {
  private documents: Map<string, Document> = new Map();
  private config: RAGConfig;

  constructor(config: RAGConfig = DEFAULT_RAG_CONFIG) {
    this.config = config;
  }

  /**
   * Add a document to the store
   */
  async addDocument(doc: Omit<Document, 'id' | 'embedding'>): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate chunks for large documents (for future use)
    // const chunks = chunkText(doc.content, this.config.chunkSize, this.config.chunkOverlap);
    
    // For simplicity, we'll store the whole document with embedding of the full content
    // In a real implementation, you'd store chunks separately
    const embedding = generateSimpleEmbedding(doc.content);
    
    const document: Document = {
      ...doc,
      id,
      embedding,
      metadata: {
        ...doc.metadata,
        timestamp: Date.now(),
        size: doc.content.length,
      },
    };

    this.documents.set(id, document);
    
    // Limit the number of documents
    if (this.documents.size > this.config.maxDocuments) {
      const oldestId = Array.from(this.documents.entries())
        .sort((a, b) => (a[1].metadata?.timestamp || 0) - (b[1].metadata?.timestamp || 0))[0][0];
      this.documents.delete(oldestId);
    }

    return id;
  }

  /**
   * Remove a document from the store
   */
  removeDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  /**
   * Get all documents
   */
  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  /**
   * Search for relevant documents based on query
   */
  async searchDocuments(query: string): Promise<Document[]> {
    if (!query.trim()) return [];

    const queryEmbedding = generateSimpleEmbedding(query);
    const results: Array<{ doc: Document; score: number }> = [];

    for (const doc of this.documents.values()) {
      let score = 0;
      
      // Use embedding similarity if available
      if (doc.embedding) {
        score = cosineSimilarity(queryEmbedding, doc.embedding);
      } else {
        // Fallback to simple text similarity
        score = calculateSimpleSimilarity(query, doc.content);
      }

      if (score >= this.config.similarityThreshold) {
        results.push({ doc, score });
      }
    }

    // Sort by relevance score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxRetrievedDocs)
      .map(r => r.doc);
  }

  /**
   * Generate context from retrieved documents
   */
  generateContext(documents: Document[]): string {
    if (documents.length === 0) return '';

    const context = documents
      .map((doc, index) => `Document ${index + 1} (${doc.title}):\n${doc.content}`)
      .join('\n\n---\n\n');

    return `Context from ${documents.length} relevant document(s):\n\n${context}`;
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
  }

  /**
   * Get store statistics
   */
  getStats(): { documentCount: number; totalSize: number } {
    const docs = Array.from(this.documents.values());
    return {
      documentCount: docs.length,
      totalSize: docs.reduce((sum, doc) => sum + (doc.metadata?.size || 0), 0),
    };
  }
}

// Global RAG store instance
export const ragStore = new RAGStore();
