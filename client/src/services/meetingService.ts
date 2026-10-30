import { apiRequest } from './apiClient'
import { MeetingRecord, SystemHealth } from '../types'

export interface CreateMeetingPayload {
  title?: string
  isPrivate?: boolean
  passcode?: string
  workspaceId?: string
}

export interface MeetingAccessResponse {
  meeting: any
  isHost: boolean
  iceServers: RTCIceServer[]
}

export const meetingService = {
  async getMeetings(): Promise<MeetingRecord[]> {
    return apiRequest<MeetingRecord[]>('/meetings')
  },

  async getMeetingByRoomId(roomId: string): Promise<MeetingRecord> {
    return apiRequest<MeetingRecord>(`/meetings/${roomId}`)
  },

  async createMeeting(payload: CreateMeetingPayload): Promise<any> {
    return apiRequest<any>('/meetings/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async validateMeeting(roomId: string): Promise<MeetingAccessResponse> {
    return apiRequest<MeetingAccessResponse>(`/meetings/validate/${roomId}`)
  },

  async getSfuToken(roomId: string): Promise<any> {
    return apiRequest<any>(`/meetings/${roomId}/token`)
  },

  async endMeeting(roomId: string): Promise<any> {
    return apiRequest<any>(`/meetings/${roomId}/end`, {
      method: 'POST',
    })
  },

  async getMeetingMessages(roomId: string): Promise<any[]> {
    return apiRequest<any[]>(`/messages?meetingId=${roomId}`)
  },

  async saveMeeting(payload: Partial<MeetingRecord>): Promise<MeetingRecord> {
    return apiRequest<MeetingRecord>('/meetings', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async uploadRecording(formData: FormData): Promise<any> {
    return apiRequest<any>('/recordings/upload', {
      method: 'POST',
      body: formData,
    })
  },

  async getHealth(): Promise<SystemHealth> {
    return apiRequest<SystemHealth>('/health')
  },
}
