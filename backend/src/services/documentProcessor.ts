/**
 * 文档处理服务
 * 处理文档解析和分块
 */

import fs from 'fs'
import path from 'path'

export interface ProcessedChunk {
  content: string
  metadata: Record<string, any>
}

export class DocumentProcessor {
  private chunkSize = 1000
  private chunkOverlap = 200

  /**
   * 处理文件，返回分块
   */
  async processFile(filePath: string, mimeType: string): Promise<ProcessedChunk[]> {
    let text = ''

    try {
      // 根据文件类型处理
      switch (mimeType) {
        case 'application/pdf':
          text = await this.processPDF(filePath)
          break
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = await this.processWord(filePath)
          break
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.ms-excel':
          text = await this.processExcel(filePath)
          break
        case 'text/plain':
        case 'text/markdown':
          text = fs.readFileSync(filePath, 'utf-8')
          break
        default:
          // 尝试作为文本文件读取
          text = fs.readFileSync(filePath, 'utf-8')
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
      // 如果解析失败，返回文件名作为内容
      text = `文件: ${path.basename(filePath)}\n类型: ${mimeType}\n无法解析此文件内容`
    }

    // 如果内容为空，返回默认内容
    if (!text.trim()) {
      text = `文件: ${path.basename(filePath)}\n内容为空或无法解析`
    }

    // 分块
    return this.splitText(text, {
      source: path.basename(filePath),
      file_path: filePath,
      mime_type: mimeType
    })
  }

  /**
   * 处理 PDF 文件
   */
  private async processPDF(filePath: string): Promise<string> {
    try {
      // @ts-ignore - pdf-parse 类型定义问题
      const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'))
      const buffer = fs.readFileSync(filePath)
      const data = await pdfParse(buffer)
      return data.text
    } catch (error) {
      console.error('PDF parsing error:', error)
      // 如果解析失败，尝试使用简单的方式读取文本
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        // 提取可读文本（ASCII 和中文）
        const textMatch = content.match(/[\x20-\x7E一-龥]+/g)
        return textMatch ? textMatch.join('\n') : 'PDF 内容无法解析'
      } catch {
        throw new Error('PDF 解析失败')
      }
    }
  }

  /**
   * 处理 Word 文件
   */
  private async processWord(filePath: string): Promise<string> {
    try {
      const mammoth = await import('mammoth')
      const buffer = fs.readFileSync(filePath)
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } catch (error) {
      console.error('Word parsing error:', error)
      throw new Error('Word 文档解析失败')
    }
  }

  /**
   * 处理 Excel 文件
   */
  private async processExcel(filePath: string): Promise<string> {
    try {
      const XLSX = await import('xlsx')
      const workbook = XLSX.readFile(filePath)
      let text = ''

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        text += `=== Sheet: ${sheetName} ===\n${csv}\n\n`
      }

      return text
    } catch (error) {
      console.error('Excel parsing error:', error)
      throw new Error('Excel 文件解析失败')
    }
  }

  /**
   * 处理文本内容
   */
  processText(text: string, metadata: Record<string, any> = {}): ProcessedChunk[] {
    return this.splitText(text, metadata)
  }

  /**
   * 文本分块
   */
  private splitText(text: string, metadata: Record<string, any>): ProcessedChunk[] {
    const chunks: ProcessedChunk[] = []

    // 首先按段落分割
    const paragraphs = text.split(/\n\s*\n/)

    let currentChunk = ''
    let chunkIndex = 0

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim()
      if (!trimmedParagraph) continue

      // 如果当前段落已经超过 chunkSize，需要进一步分割
      if (trimmedParagraph.length > this.chunkSize) {
        // 先保存当前 chunk
        if (currentChunk.trim()) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: { ...metadata, chunk_index: chunkIndex++ }
          })
          currentChunk = ''
        }

        // 按句子分割长段落
        const sentences = trimmedParagraph.split(/[。！？.!?]/)
        for (const sentence of sentences) {
          if (!sentence.trim()) continue

          if (currentChunk.length + sentence.length > this.chunkSize && currentChunk.length > 0) {
            chunks.push({
              content: currentChunk.trim(),
              metadata: { ...metadata, chunk_index: chunkIndex++ }
            })
            // 保留重叠部分
            currentChunk = currentChunk.slice(-this.chunkOverlap) + sentence
          } else {
            currentChunk += (currentChunk ? '。' : '') + sentence
          }
        }
      } else if (currentChunk.length + trimmedParagraph.length > this.chunkSize && currentChunk.length > 0) {
        // 保存当前 chunk
        chunks.push({
          content: currentChunk.trim(),
          metadata: { ...metadata, chunk_index: chunkIndex++ }
        })
        // 保留重叠部分
        currentChunk = currentChunk.slice(-this.chunkOverlap) + '\n\n' + trimmedParagraph
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph
      }
    }

    // 添加最后一个块
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { ...metadata, chunk_index: chunkIndex }
      })
    }

    // 如果没有分块，创建一个默认块
    if (chunks.length === 0 && text.trim()) {
      chunks.push({
        content: text.trim().substring(0, this.chunkSize),
        metadata: { ...metadata, chunk_index: 0 }
      })
    }

    return chunks
  }

  /**
   * 计算 token 数量（估算）
   */
  estimateTokens(text: string): number {
    // 中文大约 1.5 字/token，英文大约 4 字符/token
    const chineseChars = (text.match(/[一-龥]/g) || []).length
    const otherChars = text.length - chineseChars
    return Math.ceil(chineseChars / 1.5 + otherChars / 4)
  }
}

export const documentProcessor = new DocumentProcessor()
