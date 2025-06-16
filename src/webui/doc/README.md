# Documentation

This folder contains documentation for the webui application features.

## Available Documentation

### 📚 RAG (Retrieval-Augmented Generation) System

- **[RAG Quick Start Guide](./RAG_QUICK_START.md)** - Get up and running with RAG in minutes
- **[RAG Usage Guide](./RAG_USAGE_GUIDE.md)** - Comprehensive documentation for the RAG system
- **[File Upload Guide](./FILE_UPLOAD_GUIDE.md)** - How to handle file uploads (existing)

## RAG System Overview

The RAG system enhances chat conversations by providing relevant context from a knowledge base of documents. Key features include:

- ✅ **Document Storage** - Persistent storage with IndexedDB
- ✅ **Text Processing** - Automatic chunking and embedding generation
- ✅ **Similarity Search** - Find relevant documents based on user queries
- ✅ **Context Generation** - Format retrieved documents for AI consumption
- ✅ **File Integration** - Process uploaded files into the knowledge base

## Quick Links

| Feature | Quick Start | Full Documentation |
|---------|-------------|-------------------|
| RAG System | [Quick Start](./RAG_QUICK_START.md) | [Full Guide](./RAG_USAGE_GUIDE.md) |
| File Uploads | - | [Upload Guide](./FILE_UPLOAD_GUIDE.md) |

## Getting Started

1. Start with the [RAG Quick Start Guide](./RAG_QUICK_START.md) for a 5-minute introduction
2. Review the [RAG Usage Guide](./RAG_USAGE_GUIDE.md) for comprehensive implementation details
3. Check out the file upload integration for adding documents to your knowledge base

## Implementation Status

### ✅ Completed Features

- Basic RAG store with document management
- Simple text similarity and embedding generation
- IndexedDB persistence layer
- Search and retrieval functionality
- Context generation for AI systems
- File upload processing integration

### 🚧 Future Enhancements

- Semantic embeddings (OpenAI, sentence-transformers)
- Vector database integration
- Advanced chunking strategies
- Metadata-based filtering
- Real-time document indexing
- Performance optimizations

## Contributing

When adding new features or documentation:

1. Update relevant documentation files
2. Add examples and usage patterns
3. Include troubleshooting information
4. Test all code examples
5. Follow markdown linting rules

## Support

- Check the troubleshooting sections in each guide
- Review inline code comments in `src/utils/rag.ts`
- Look at existing implementation patterns in the codebase
