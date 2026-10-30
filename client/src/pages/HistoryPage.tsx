import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  History,
  Calendar,
  Users,
  CheckCircle2,
  FileText,
  Shield,
  ListTodo,
  ArrowLeft,
  Video,
  Search,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { meetingService } from '../services/meetingService'
import { MeetingRecord } from '../types'

export const HistoryPage: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => meetingService.getMeetings(),
  })

  const filteredMeetings = meetings.filter((m: any) => {
    const text = (m.title || m.roomId || '').toLowerCase()
    return text.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAECF0]">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#101828] flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#2563EB]" />
            Meeting History & Archive
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Browse completed collaboration sessions, generated summaries, and assignable to-do items.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search archive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Past Meetings */}
        <div className="lg:col-span-5 space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#667085]">
              Loading meeting archive...
            </div>
          ) : filteredMeetings.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <Video className="w-8 h-8 text-[#98A2B3] mx-auto" />
              <div className="text-sm font-semibold text-[#101828]">No Meetings Found</div>
              <div className="text-xs text-[#667085]">
                Completed sessions and summaries will appear here.
              </div>
            </Card>
          ) : (
            filteredMeetings.map((m: any) => (
              <div
                key={m.roomId || m._id}
                onClick={() => setSelectedMeeting(m)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedMeeting?.roomId === m.roomId
                    ? 'bg-[#EFF8FF] border-[#2563EB] shadow-subtle'
                    : 'bg-white border-[#EAECF0] hover:border-[#D0D5DD] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-[#101828]">
                    {m.title || m.roomId}
                  </span>
                  <Badge variant="primary" size="sm">
                    {m.roomId}
                  </Badge>
                </div>
                <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
                  {m.summary || 'Sprint session with active multi-user discussions.'}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-[#667085] mt-3 pt-2 border-t border-[#EAECF0]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#98A2B3]" /> {m.hostName || 'Team'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#98A2B3]" />
                    {new Date(m.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7">
          {selectedMeeting ? (
            <Card className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#101828]">
                    {selectedMeeting.title || selectedMeeting.roomId}
                  </h2>
                  <div className="text-xs text-[#667085] mt-0.5">
                    Room Code: <span className="font-mono text-[#2563EB] font-bold">{selectedMeeting.roomId}</span>
                  </div>
                </div>
                <Link to={`/room/${selectedMeeting.roomId}`}>
                  <Button variant="primary" size="sm" icon={<Video className="w-4 h-4" />}>
                    Rejoin Room
                  </Button>
                </Link>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  Executive Summary
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] text-xs text-[#344054] leading-relaxed">
                  {selectedMeeting.summary || 'No summary recorded for this session.'}
                </div>
              </div>

              {/* Key Decisions */}
              {selectedMeeting.keyDecisions && selectedMeeting.keyDecisions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#12B76A] flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Key Decisions
                  </div>
                  <ul className="space-y-1.5">
                    {selectedMeeting.keyDecisions.map((decision, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-[#EAECF0] text-xs text-[#344054] flex items-start gap-2"
                      >
                        <span className="text-[#12B76A] font-bold mt-0.5">•</span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#F79009] flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4" />
                    Action Items ({selectedMeeting.actionItems.length})
                  </div>
                  <div className="space-y-1.5">
                    {selectedMeeting.actionItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          item.completed
                            ? 'bg-[#F8FAFC] border-[#EAECF0] text-[#98A2B3] line-through'
                            : 'bg-white border-[#EAECF0] text-[#101828]'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            item.completed ? 'text-[#12B76A]' : 'text-[#D0D5DD]'
                          }`}
                        />
                        <div className="space-y-0.5">
                          <div>{item.text}</div>
                          <div className="text-[10px] text-[#667085]">
                            Assignee: <span className="text-[#2563EB] font-medium">{item.assignee}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="py-16 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#98A2B3] mx-auto" />
              <div className="text-sm font-semibold text-[#101828]">Select a Meeting Session</div>
              <div className="text-xs text-[#667085] max-w-sm mx-auto">
                Click on any session in the list to inspect its executive summary, key decisions, and action items.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
