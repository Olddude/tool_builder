import { MessageExtraFile, MessageExtraTextFile } from './types';

/**
 * Maximum file size for uploads (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Text file extensions and MIME types that should be treated as text files
 */
const TEXT_FILE_PATTERNS = [
  // Text files
  /^text\//,
  // Programming languages
  /^application\/(javascript|json|xml|yaml)$/,
  /^application\/x-(python|java|c|cpp|csharp|php|ruby|perl|shell|sh)$/,
  // Configuration files
  /^application\/(toml|ini)$/,
];

/**
 * Check if a MIME type represents a text file
 */
function isTextMimeType(mimeType: string): boolean {
  return TEXT_FILE_PATTERNS.some(pattern => pattern.test(mimeType));
}

/**
 * Get MIME type from file extension as fallback
 */
function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    // Text files
    'txt': 'text/plain',
    'md': 'text/markdown',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'csv': 'text/csv',
    'rtf': 'text/rtf',
    
    // Programming languages
    'js': 'application/javascript',
    'mjs': 'application/javascript',
    'json': 'application/json',
    'py': 'text/x-python',
    'java': 'text/x-java',
    'c': 'text/x-c',
    'cpp': 'text/x-c++',
    'cc': 'text/x-c++',
    'cxx': 'text/x-c++',
    'h': 'text/x-c',
    'hpp': 'text/x-c++',
    'cs': 'text/x-csharp',
    'php': 'text/x-php',
    'rb': 'text/x-ruby',
    'pl': 'text/x-perl',
    'sh': 'application/x-sh',
    'bash': 'application/x-sh',
    'zsh': 'application/x-sh',
    'fish': 'application/x-sh',
    'sql': 'text/x-sql',
    'xml': 'application/xml',
    'yaml': 'application/yaml',
    'yml': 'application/yaml',
    'toml': 'application/toml',
    'ini': 'text/plain',
    'cfg': 'text/plain',
    'conf': 'text/plain',
    'log': 'text/plain',
    
    // TypeScript
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    
    // Markup
    'svg': 'image/svg+xml',
    
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Media
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Check if a file extension suggests it's a text file
 */
function isTextFileExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  const textExtensions = [
    'txt', 'md', 'html', 'htm', 'css', 'csv', 'rtf',
    'js', 'mjs', 'json', 'py', 'java', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp',
    'cs', 'php', 'rb', 'pl', 'sh', 'bash', 'zsh', 'fish', 'sql', 'xml',
    'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'log', 'ts', 'tsx'
  ];
  return textExtensions.includes(ext || '');
}

/**
 * Read file as base64 string
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const result = event.target.result as string;
        // Remove data URL prefix (data:mimeType;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as text string
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
}

/**
 * Process a file and return appropriate MessageExtra based on file type
 */
export async function processFile(file: File): Promise<MessageExtraFile | MessageExtraTextFile> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" is too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`);
  }

  // Determine MIME type
  const mimeType = file.type || getMimeTypeFromExtension(file.name);
  const isText = isTextMimeType(mimeType) || isTextFileExtension(file.name);

  try {
    if (isText) {
      // For text files, try to read as text first for better compatibility
      try {
        const textContent = await readFileAsText(file);
        return {
          type: 'textFile',
          name: file.name,
          content: textContent,
        };
      } catch {
        // If text reading fails, fall back to base64
        const base64Content = await readFileAsBase64(file);
        return {
          type: 'file',
          name: file.name,
          mimeType,
          size: file.size,
          content: base64Content,
          isText: true,
        };
      }
    } else {
      // For binary files, always use base64
      const base64Content = await readFileAsBase64(file);
      return {
        type: 'file',
        name: file.name,
        mimeType,
        size: file.size,
        content: base64Content,
        isText: false,
      };
    }
  } catch (error) {
    throw new Error(`Failed to process file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a user-friendly file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get file type category for display purposes
 */
export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('audio/')) return 'Audio';
  if (mimeType.startsWith('text/') || isTextMimeType(mimeType)) return 'Text';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'Archive';
  return 'File';
}
