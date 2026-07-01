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
    const fileName = path.basename(filePath)
    let text = ''

    try {
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
          try {
            text = fs.readFileSync(filePath, 'utf-8')
          } catch {
            text = ''
          }
      }
    } catch (error: any) {
      console.error(`[DocProcessor] 文件解析失败: ${fileName}, error: ${error.message}`)
      text = ''
    }

    // 清理文本
    text = this.cleanText(text)

    // 如果内容为空或太短，返回文件元信息作为内容
    if (text.length < 10) {
      console.warn(`[DocProcessor] 文件内容为空或过短: ${fileName} (${text.length} chars)`)
      text = `文件名: ${fileName}\n文件类型: ${mimeType}\n注意: 此文件内容无法解析，可能是扫描件或加密文件。`
    }

    console.log(`[DocProcessor] 文件 ${fileName}: 解析得到 ${text.length} 个字符`)

    // 分块
    return this.splitText(text, {
      source: fileName,
      file_path: filePath,
      mime_type: mimeType
    })
  }

  /**
   * 处理 PDF 文件（使用 pdfjs-dist）
   */
  private async processPDF(filePath: string): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
      const data = new Uint8Array(fs.readFileSync(filePath))
      const doc = await pdfjsLib.getDocument({ data }).promise

      let fullText = ''
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const content = await page.getTextContent()
        const text = content.items.map((item: any) => item.str).join(' ')
        fullText += text + '\n'
      }

      fullText = fullText.trim()
      if (fullText.length > 10) {
        console.log(`[DocProcessor] PDF 解析成功: ${doc.numPages} 页, ${fullText.length} 字符`)
        return fullText
      }

      console.warn(`[DocProcessor] PDF 解析内容过少: ${fullText.length} 字符`)
      return ''
    } catch (error: any) {
      console.error(`[DocProcessor] PDF 解析错误: ${error.message}`)
      return ''
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
      console.log(`[DocProcessor] Word 解析成功: ${result.value.length} 字符`)
      return result.value
    } catch (error: any) {
      console.error(`[DocProcessor] Word 解析错误: ${error.message}`)
      throw error
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

      console.log(`[DocProcessor] Excel 解析成功: ${workbook.SheetNames.length} 个 sheet, ${text.length} 字符`)
      return text
    } catch (error: any) {
      console.error(`[DocProcessor] Excel 解析错误: ${error.message}`)
      throw error
    }
  }

  /**
   * 清理文本
   */
  private cleanText(text: string): string {
    return text
      // 移除控制字符（保留换行和制表符）
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      // 移除连续空行
      .replace(/\n{3,}/g, '\n\n')
      // 移除首尾空白
      .trim()
  }

  /**
   * 处理文本内容
   */
  processText(text: string, metadata: Record<string, any> = {}): ProcessedChunk[] {
    return this.splitText(this.cleanText(text), metadata)
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
            currentChunk = currentChunk.slice(-this.chunkOverlap) + sentence
          } else {
            currentChunk += (currentChunk ? '。' : '') + sentence
          }
        }
      } else if (currentChunk.length + trimmedParagraph.length > this.chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { ...metadata, chunk_index: chunkIndex++ }
        })
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

    console.log(`[DocProcessor] 分块完成: ${chunks.length} 个 chunks`)
    return chunks
  }

  /**
   * 计算 token 数量（估算）
   */
  estimateTokens(text: string): number {
    const chineseChars = (text.match(/[一-鿿]/g) || []).length
    const otherChars = text.length - chineseChars
    return Math.ceil(chineseChars / 1.5 + otherChars / 4)
  }
}

export const documentProcessor = new DocumentProcessor()
