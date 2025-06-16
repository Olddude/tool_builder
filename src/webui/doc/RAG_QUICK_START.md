# RAG Quick Start Guide

This guide will help you get started with the RAG (Retrieval-Augmented Generation) system in just a few minutes.

## 🚀 Quick Start

### 1. Import the RAG Store

```typescript
import { ragStore } from './utils/rag';
```

### 2. Add Your First Document

```typescript
// Add a document to the knowledge base
const docId = await ragStore.addDocument({
  title: "Getting Started Guide",
  content: "This is a comprehensive guide on how to get started with our application...",
  metadata: {
    source: "documentation",
    type: "guide"
  }
});

console.log(`✅ Document added: ${docId}`);
```

### 3. Search for Relevant Information

```typescript
// Search for documents related to your query
const query = "how to get started";
const docs = await ragStore.searchDocuments(query);

console.log(`📚 Found ${docs.length} relevant documents`);
```

### 4. Generate Context for AI

```typescript
// Create formatted context for the AI
const context = ragStore.generateContext(docs);
console.log("🤖 AI Context:", context);
```

## 📝 Complete Example

Here's a complete example showing how to integrate RAG with your chat system:

```typescript
import { ragStore } from './utils/rag';

// 1. Initialize with some sample documents
const initializeKnowledgeBase = async () => {
  const docs = [
    {
      title: "API Documentation",
      content: "Our API provides RESTful endpoints for user management, authentication, and data processing..."
    },
    {
      title: "Troubleshooting Guide", 
      content: "Common issues include authentication failures, network timeouts, and data validation errors..."
    }
  ];

  for (const doc of docs) {
    await ragStore.addDocument(doc);
  }
  
  console.log("✅ Knowledge base initialized");
};

// 2. Enhanced chat function with RAG
const chatWithRAG = async (userMessage: string) => {
  // Search for relevant context
  const relevantDocs = await ragStore.searchDocuments(userMessage);
  
  if (relevantDocs.length > 0) {
    // Add context to the message
    const context = ragStore.generateContext(relevantDocs);
    const enhancedMessage = `${context}\n\nUser: ${userMessage}`;
    
    console.log("🔍 Using context from", relevantDocs.length, "documents");
    return enhancedMessage;
  }
  
  return userMessage;
};

// 3. Usage
const main = async () => {
  await initializeKnowledgeBase();
  
  const userQuestion = "How do I fix authentication errors?";
  const enhancedMessage = await chatWithRAG(userQuestion);
  
  // Send enhancedMessage to your AI system
  console.log("📤 Sending to AI:", enhancedMessage);
};

main();
```

## 🛠️ Integration with File Uploads

```typescript
// Handle file uploads and add to RAG
const handleFileUpload = async (files: File[]) => {
  const processedFiles = [];
  
  for (const file of files) {
    if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
      const content = await file.text();
      
      const docId = await ragStore.addDocument({
        title: file.name,
        content: content,
        metadata: {
          source: "file_upload",
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString()
        }
      });
      
      processedFiles.push({
        filename: file.name,
        docId: docId,
        status: "success"
      });
    }
  }
  
  return processedFiles;
};
```

## 📊 Monitor Your RAG Store

```typescript
// Get statistics about your knowledge base
const getStats = () => {
  const stats = ragStore.getStats();
  console.log(`📈 Knowledge Base Stats:
    📄 Documents: ${stats.documentCount}
    💾 Total Size: ${Math.round(stats.totalSize / 1024)} KB
  `);
};

// List all documents
const listDocuments = () => {
  const docs = ragStore.getAllDocuments();
  console.log("📚 All Documents:");
  docs.forEach((doc, i) => {
    console.log(`  ${i + 1}. ${doc.title} (${doc.content.length} chars)`);
  });
};
```

## ⚙️ Configuration

Customize the RAG behavior:

```typescript
import { RAGStore } from './utils/rag';

const customRAG = new RAGStore({
  maxDocuments: 500,        // Store up to 500 documents
  chunkSize: 800,          // 800 character chunks
  chunkOverlap: 150,       // 150 character overlap
  similarityThreshold: 0.3, // Lower threshold = more results
  maxRetrievedDocs: 8      // Return up to 8 documents
});
```

## 🎯 Best Practices

### 1. Document Quality

- Use descriptive titles
- Include relevant metadata
- Clean and format text content

### 2. Search Optimization

- Use specific keywords in queries
- Adjust similarity threshold based on your needs
- Monitor search results quality

### 3. Performance

- Limit document size and count
- Use appropriate chunk sizes
- Monitor memory usage

### 4. Maintenance

```typescript
// Regular cleanup
const cleanupOldDocuments = () => {
  const docs = ragStore.getAllDocuments();
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  docs.forEach(doc => {
    if (doc.metadata?.timestamp && doc.metadata.timestamp < oneWeekAgo) {
      ragStore.removeDocument(doc.id);
    }
  });
};
```

## 🐛 Troubleshooting

### No Search Results?

```typescript
// Check if documents exist
const docCount = ragStore.getAllDocuments().length;
console.log(`Documents in store: ${docCount}`);

// Try lower similarity threshold
const results = await ragStore.searchDocuments(query);
if (results.length === 0) {
  console.log("💡 Try using more specific keywords or lower similarity threshold");
}
```

### Performance Issues?

```typescript
// Check store size
const stats = ragStore.getStats();
if (stats.documentCount > 1000) {
  console.log("⚠️ Large document count may impact performance");
}
```

## 🔗 Next Steps

1. Check out the [full documentation](./RAG_USAGE_GUIDE.md)
2. Explore advanced features like custom configurations
3. Integrate with your existing chat components
4. Consider upgrading to semantic embeddings for production use

---

**Need help?** Check the troubleshooting section in the full documentation or review the inline code comments in `utils/rag.ts`.
