import { apiRequest } from './apiClient'
import { MeetingRecord, SystemHealth } from '../types'

export const meetingService = {
  async getMeetings(): Promise<MeetingRecord[]> {
    return apiRequest<MeetingRecord[]>('/meetings')
  },

  async getMeetingByRoomId(roomId: string): Promise<MeetingRecord> {
    return apiRequest<MeetingRecord>(`/meetings/${roomId}`)
  },

  async saveMeeting(payload: Partial<MeetingRecord>): Promise<MeetingRecord> {
    return apiRequest<MeetingRecord>('/meetings', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async getHealth(): Promise<SystemHealth> {
    return apiRequest<SystemHealth>('/health')
  },
}
