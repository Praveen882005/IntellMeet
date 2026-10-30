import { Request, Response } from 'express'
import { AiService } from '../services/ai.service'
import { ApiResponse } from '../utils/apiResponse'

export const summarizeMeeting = async (req: Request, res: Response): Promise<void> => {
  const { roomName = 'IntellMeet Session', transcript = [], messages = [] } = req.body

  const formattedTranscript = transcript.map((t: { speaker: string; text: string; timestamp?: string }) => ({
    speaker: t.speaker,
    text: t.text,
    timestamp: t.timestamp,
  }))

  const formattedMessages = messages
    .filter((m: { isSystem?: boolean }) => !m.isSystem)
    .map((m: { sender: string; text: string; timestamp?: string }) => ({
      speaker: m.sender,
      text: m.text,
      timestamp: m.timestamp,
    }))

  const summary = await AiService.summarizeConversation(
    roomName,
    formattedTranscript,
    formattedMessages
  )

  ApiResponse.success(res, summary, 'Meeting intelligence summary generated')
}
