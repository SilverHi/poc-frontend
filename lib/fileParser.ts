export interface ParsedFile {
  content: string;
  metadata?: {
    pages?: number;
    successfulPages?: number;
    info?: Record<string, unknown>;
  };
}

export async function parsePDF(buffer: Buffer): Promise<ParsedFile> {
  try {
    // Use pdf-parse library for simple and reliable PDF text extraction
    const pdfParse = (await import('pdf-parse')).default;
    
    // Parse the PDF buffer
    const data = await pdfParse(buffer);
    
    // Clean up the extracted text
    const cleanText = data.text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n')  // Clean up multiple newlines
      .trim();
    
    // If no meaningful text was extracted, consider it a failure
    if (!cleanText || cleanText.length < 10) {
      throw new Error(`无法从PDF文档中提取文本内容。可能是图片PDF、加密PDF或损坏的文件。`);
    }
    
    return {
      content: cleanText,
      metadata: {
        pages: data.numpages,
        successfulPages: data.numpages,
        info: {
          title: data.info?.Title || '',
          author: data.info?.Author || '',
          subject: data.info?.Subject || '',
          creator: data.info?.Creator || '',
          producer: data.info?.Producer || '',
          creationDate: data.info?.CreationDate || '',
          modificationDate: data.info?.ModDate || '',
        }
      }
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    // 现在直接抛出错误，不返回fallback内容
    throw new Error(`PDF解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

export function parseMarkdown(content: string): ParsedFile {
  // Remove markdown syntax for plain text extraction
  const plainText = content
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove emphasis and strong
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove lists
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    content: plainText
  };
}

export function parseTextFile(content: string): ParsedFile {
  return {
    content: content.trim()
  };
}

export async function parseFile(buffer: Buffer, fileName: string): Promise<ParsedFile> {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return await parsePDF(buffer);
    case 'md':
    case 'markdown':
      return parseMarkdown(buffer.toString('utf-8'));
    case 'txt':
      return parseTextFile(buffer.toString('utf-8'));
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
} 