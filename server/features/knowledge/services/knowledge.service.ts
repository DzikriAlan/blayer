import { notFoundError } from '../../../shared/http-error'
import type {
  CreateKnowledgeDto,
  KnowledgeResponseDto,
  UpdateKnowledgeDto,
} from '../dto/knowledge.dto'
import {
  knowledgeRepository,
  type KnowledgeRepository,
} from '../repositories/knowledge.repository'

export class KnowledgeService {
  constructor(private readonly knowledgeRepository: KnowledgeRepository) {}

  // Isi dokumen bisa panjang; daftarnya cukup membawa cuplikan supaya UI tidak
  // menarik puluhan ribu karakter hanya untuk menampilkan judul.
  async fetchKnowledgeList(projectId: string): Promise<KnowledgeResponseDto[]> {
    const documents = await this.knowledgeRepository.getKnowledgeMany(projectId)

    return documents.map((document) => ({
      id: document.id,
      title: document.title,
      preview: document.content.slice(0, 240),
      totalChars: document.content.length,
      updatedAt: document.updatedAt.toISOString(),
    }))
  }

  async fetchKnowledge(id: string) {
    const document = await this.fetchKnowledgeRecord(id)

    return {
      id: document.id,
      title: document.title,
      content: document.content,
      updatedAt: document.updatedAt.toISOString(),
    }
  }

  async storeKnowledge(projectId: string, dto: CreateKnowledgeDto) {
    return this.knowledgeRepository.postKnowledge({
      projectId,
      title: dto.title,
      content: dto.content,
    })
  }

  async changeKnowledge(id: string, dto: UpdateKnowledgeDto) {
    await this.fetchKnowledgeRecord(id)

    return this.knowledgeRepository.updateKnowledge(id, {
      title: dto.title,
      content: dto.content,
    })
  }

  async removeKnowledge(id: string) {
    await this.fetchKnowledgeRecord(id)

    return this.knowledgeRepository.deleteKnowledge(id)
  }

  private async fetchKnowledgeRecord(id: string) {
    const document = await this.knowledgeRepository.getKnowledgeById(id)

    if (!document) {
      throw notFoundError(
        'DOCUMENT_NOT_FOUND',
        'Dokumen dengan id itu tidak ada.'
      )
    }

    return document
  }
}

export const knowledgeService = new KnowledgeService(knowledgeRepository)
