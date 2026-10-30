import { apiRequest } from './apiClient'
import { AiSummaryPayload, ChatMessage, TranscriptEntry } from '../types'

export interface SummarizeParams {
  roomName: string
  transcript: TranscriptEntry[]
  messages: ChatMessage[]
}

export const aiService = {
  async summarize(params: SummarizeParams): Promise<AiSummaryPayload> {
    return apiRequest<AiSummaryPayload>('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },
}
