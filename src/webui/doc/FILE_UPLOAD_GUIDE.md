# Enhanced File Upload Feature

## Overview

The file upload feature has been enhanced to support robust handling of all file types with base64 encoding and MIME type detection. This allows the chat interface to handle text files, images, documents, and binary files seamlessly.

## Features

### Supported File Types

#### Text Files

- **Programming Languages**: `.js`, `.ts`, `.py`, `.java`, `.c`, `.cpp`, `.cs`, `.php`, `.rb`, etc.
- **Configuration**: `.json`, `.yaml`, `.xml`, `.toml`, `.ini`, `.cfg`
- **Documentation**: `.md`, `.txt`, `.html`, `.css`
- **Data**: `.csv`, `.sql`, `.log`

#### Binary Files

- **Images**: `.jpg`, `.png`, `.gif`, `.webp`, `.svg`, etc.
- **Documents**: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`
- **Archives**: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`
- **Media**: `.mp3`, `.wav`, `.mp4`, `.avi`, `.mov`

### Processing Logic

1. **File Size Validation**: Maximum 10MB per file
2. **MIME Type Detection**: Uses browser's File API with fallback to extension-based detection
3. **Content Processing**:
   - **Text Files**: Read as UTF-8 text for optimal display
   - **Binary Files**: Encoded as base64 with metadata

### File Display

#### In Chat Messages

- **Text Files**: Displayed inline with syntax highlighting
- **Images**: Rendered as image previews (max 200px height)
- **Binary Files**: Show metadata with download option

#### File Selection UI

- Shows file count, type category, and size
- Individual file removal buttons
- "Clear all" button for bulk removal
- File type and size indicators

## Technical Implementation

### New Types

```typescript
interface MessageExtraFile {
  type: 'file';
  name: string;
  mimeType: string;
  size: number;
  content: string; // base64 encoded
  isText?: boolean; // indicates text file stored as base64
}
```

### File Processing Flow

1. **Selection**: User selects files via file input
2. **Validation**: Check file size limits
3. **Type Detection**: Determine MIME type and text/binary classification
4. **Content Reading**:
   - Text files → UTF-8 string
   - Binary files → base64 string
5. **Metadata Extraction**: Size, type category, etc.
6. **Message Integration**: Attach as MessageExtra to user message

### API Integration

Files are included in the message context sent to the language model:

```text
--- File: example.py (text/x-python) ---
[file content here]
--- End of File ---

--- File: image.png ---
Type: image/png
Size: 245KB
Content: [Base64 encoded binary data]
Base64: data:image/png;base64,[base64-content]
--- End of File ---
```

## Usage

### For Users

1. Click the file input button in the chat interface
2. Select one or multiple files
3. Review selected files (shown with type and size)
4. Type your message and send
5. Files will be included in the message context

### For Developers

#### Adding New File Type Support

1. Update MIME type patterns in `fileUtils.ts`
2. Add extension mappings if needed
3. Customize display logic in `ChatMessage.tsx`

#### Customizing File Processing

- Modify `processFile()` function in `fileUtils.ts`
- Adjust size limits via `MAX_FILE_SIZE` constant
- Update text file detection patterns

## Error Handling

- **File Too Large**: Shows error with size limit
- **Read Errors**: Graceful fallback to base64 for text files
- **Partial Failures**: Continues with successfully processed files
- **User Feedback**: Clear error messages and file status indicators

## Model Compatibility

The enhanced file upload provides base64 content with MIME types, making it compatible with:

- **Vision Models**: Can process base64-encoded images
- **Document Models**: Can handle various document formats
- **Code Analysis**: Supports all programming languages
- **General LLMs**: Receive structured file information

## Security Considerations

- File size limits prevent memory issues
- Base64 encoding is safe for transmission
- No server-side file storage (client-side processing only)
- MIME type validation prevents malicious file handling

## Future Enhancements

- Drag-and-drop file upload
- File preview thumbnails
- Batch file operations
- Cloud storage integration
- Advanced file filtering options
