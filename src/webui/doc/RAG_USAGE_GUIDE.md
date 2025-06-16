# RAG (Retrieval-Augmented Generation) Documentation

This document describes how to use the basic RAG skeleton implemented in the webui application.

## Overview

The RAG system provides document storage, indexing, and retrieval functionality to enhance chat conversations with relevant context from uploaded documents. It consists of several key components:

- **Document Storage**: Persistent storage of documents with metadata
- **Text Processing**: Document chunking and embedding generation  
- **Similarity Search**: Finding relevant documents based on user queries
- **Context Generation**: Formatting retrieved documents for AI consumption

## Architecture

```mermaid
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Query    │───▶│   RAG Store     │───▶│   Chat System   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   IndexedDB     │
                       │   (Persistent)  │
                       └─────────────────┘
```

## Core Components

### 1. RAGStore Class

The main class that manages document operations.

```typescript
import { ragStore } from './utils/rag';
```

### 2. Document Interface

```typescript
interface Document {
  id: string;           // Unique identifier
  title: string;        // Document title
  content: string;      // Full text content
  embedding?: number[]; // Vector representation
  metadata?: {          // Optional metadata
    source?: string;
    type?: string;
    timestamp?: number;
    size?: number;
  };
}
```

### 3. Configuration

```typescript
interface RAGConfig {
  maxDocuments: number;        // Maximum documents to store (default: 1000)
  chunkSize: number;          // Text chunk size (default: 1000)
  chunkOverlap: number;       // Overlap between chunks (default: 200)
  similarityThreshold: number; // Minimum similarity score (default: 0.5)
  maxRetrievedDocs: number;   // Max documents per search (default: 5)
}
```

## Usage Examples

### Basic Usage

#### 1. Adding Documents

```typescript
import { ragStore } from './utils/rag';

// Add a simple document
const docId = await ragStore.addDocument({
  title: "Project Documentation",
  content: "This is the main project documentation...",
  metadata: {
    source: "manual_upload",
    type: "documentation"
  }
});

console.log(`Document added with ID: ${docId}`);
```

#### 2. Searching for Relevant Documents

```typescript
// Search for documents related to a query
const query = "How to configure the authentication system?";
const relevantDocs = await ragStore.searchDocuments(query);

console.log(`Found ${relevantDocs.length} relevant documents:`);
relevantDocs.forEach((doc, index) => {
  console.log(`${index + 1}. ${doc.title}`);
});
```

#### 3. Generating Context for AI

```typescript
// Generate formatted context from search results
const context = ragStore.generateContext(relevantDocs);
console.log("Context for AI:", context);

// This will output something like:
// Context from 3 relevant document(s):
// 
// Document 1 (Project Documentation):
// This is the main project documentation...
// 
// ---
// 
// Document 2 (API Guide):
// The API provides endpoints for...
```

### Advanced Usage

#### 1. Batch Document Processing

```typescript
const documents = [
  { title: "API Docs", content: "API documentation content..." },
  { title: "User Guide", content: "User guide content..." },
  { title: "FAQ", content: "Frequently asked questions..." }
];

const docIds = await Promise.all(
  documents.map(doc => ragStore.addDocument(doc))
);

console.log(`Added ${docIds.length} documents to RAG store`);
```

#### 2. Custom Configuration

```typescript
import { RAGStore, RAGConfig } from './utils/rag';

const customConfig: RAGConfig = {
  maxDocuments: 500,
  chunkSize: 800,
  chunkOverlap: 150,
  similarityThreshold: 0.3,
  maxRetrievedDocs: 8
};

const customRagStore = new RAGStore(customConfig);
```

#### 3. Document Management

```typescript
// Get all documents
const allDocs = ragStore.getAllDocuments();
console.log(`Total documents: ${allDocs.length}`);

// Get store statistics
const stats = ragStore.getStats();
console.log(`Documents: ${stats.documentCount}, Total size: ${stats.totalSize} chars`);

// Remove a specific document
const removed = ragStore.removeDocument(docId);
console.log(`Document removed: ${removed}`);

// Clear all documents
ragStore.clear();
console.log("All documents cleared");
```

## Integration with Chat System

### 1. Enhanced Message Sending

```typescript
// In your chat component
const sendEnhancedMessage = async (userMessage: string) => {
  // Search for relevant context
  const relevantDocs = await ragStore.searchDocuments(userMessage);
  
  if (relevantDocs.length > 0) {
    // Generate context from retrieved documents
    const context = ragStore.generateContext(relevantDocs);
    
    // Combine user message with context
    const enhancedMessage = `Context: ${context}\n\nUser Question: ${userMessage}`;
    
    // Send to chat system
    await sendMessage(convId, lastNodeId, enhancedMessage, extra, onChunk);
  } else {
    // Send regular message if no relevant context found
    await sendMessage(convId, lastNodeId, userMessage, extra, onChunk);
  }
};
```

### 2. File Upload Integration

```typescript
// Process uploaded files and add to RAG store
const handleFileUpload = async (files: File[]) => {
  const results = [];
  
  for (const file of files) {
    try {
      const content = await file.text();
      const docId = await ragStore.addDocument({
        title: file.name,
        content,
        metadata: {
          source: "file_upload",
          type: file.type,
          size: file.size
        }
      });
      results.push({ success: true, docId, filename: file.name });
    } catch (error) {
      results.push({ success: false, error: error.message, filename: file.name });
    }
  }
  
  return results;
};
```

## Utility Functions

### Text Processing

```typescript
import { chunkText, generateSimpleEmbedding, cosineSimilarity } from './utils/rag';

// Split large text into chunks
const chunks = chunkText(longText, 1000, 200);

// Generate embeddings (basic implementation)
const embedding = generateSimpleEmbedding("sample text");

// Calculate similarity between embeddings
const similarity = cosineSimilarity(embedding1, embedding2);
```

### Search Scoring

```typescript
import { calculateSimpleSimilarity } from './utils/rag';

// Calculate text similarity score
const score = calculateSimpleSimilarity("user query", "document content");
console.log(`Similarity score: ${score}`); // 0.0 to 1.0
```

## Persistence

Documents are automatically persisted to IndexedDB through the storage system:

- **Database**: `LlamacppWebui`
- **Table**: `ragDocuments`
- **Schema**: `&id, title, metadata.timestamp`

The storage is durable across browser sessions and automatically manages the database schema.

## Current Limitations

1. **Simple Embeddings**: Uses hash-based embeddings instead of semantic embeddings
2. **No Chunking Storage**: Stores whole documents rather than individual chunks
3. **Basic Similarity**: Uses keyword matching rather than semantic similarity
4. **Memory Storage**: RAG store operates in memory with persistence handled separately

## Future Enhancements

1. **Semantic Embeddings**: Integration with proper embedding models (OpenAI, sentence-transformers)
2. **Vector Database**: Replace simple similarity with proper vector search
3. **Chunk Management**: Store and search individual document chunks
4. **Metadata Filtering**: Advanced filtering by document type, source, date, etc.
5. **Relevance Ranking**: Improved ranking algorithms (BM25, TF-IDF)
6. **Real-time Updates**: Live document indexing and search

## Troubleshooting

### Common Issues

1. **No search results**: Check if `similarityThreshold` is too high
2. **Performance issues**: Reduce `maxDocuments` or implement pagination
3. **Storage errors**: Ensure IndexedDB is available and not full

### Debug Mode

```typescript
// Enable detailed logging
const debugSearch = async (query: string) => {
  console.log(`Searching for: "${query}"`);
  
  const docs = ragStore.getAllDocuments();
  console.log(`Total documents in store: ${docs.length}`);
  
  const results = await ragStore.searchDocuments(query);
  console.log(`Found ${results.length} relevant documents`);
  
  return results;
};
```

## API Reference

See the inline TypeScript documentation in `utils/rag.ts` for detailed API reference including all method signatures, parameters, and return types.
