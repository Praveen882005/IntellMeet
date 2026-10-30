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
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { meetingService } from '../services/meetingService'
import { MeetingRecord } from '../types'

export const HistoryPage: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null)

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => meetingService.getMeetings(),
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-brand-400" />
            Meeting History & AI Minutes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse completed collaboration sessions, generated summaries, and assignable to-do items.
          </p>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Past Meetings */}
        <div className="lg:col-span-5 space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading past meetings...
            </div>
          ) : meetings.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-2">
              <Video className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">No Meetings Found</div>
              <div className="text-xs text-slate-500">
                Completed meetings and summaries will appear here.
              </div>
            </div>
          ) : (
            meetings.map((m: any) => (
              <div
                key={m.roomId || m._id}
                onClick={() => setSelectedMeeting(m)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedMeeting?.roomId === m.roomId
                    ? 'bg-brand-950/40 border-brand-500/50 shadow-lg shadow-brand-500/10'
                    : 'bg-surface-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-slate-200">
                    {m.title || m.roomId}
                  </span>
                  <Badge variant="purple">{m.roomId}</Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {m.summary || 'Sprint session with team discussions.'}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {m.hostName || 'Team'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
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
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedMeeting.title || selectedMeeting.roomId}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Room Code: <span className="font-mono text-brand-400">{selectedMeeting.roomId}</span>
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
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-400" />
                  Executive Summary
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedMeeting.summary || 'No summary recorded for this session.'}
                </div>
              </div>

              {/* Key Decisions */}
              {selectedMeeting.keyDecisions && selectedMeeting.keyDecisions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Key Decisions
                  </div>
                  <ul className="space-y-2">
                    {selectedMeeting.keyDecisions.map((decision, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-amber-400" />
                    Action Items ({selectedMeeting.actionItems.length})
                  </div>
                  <div className="space-y-2">
                    {selectedMeeting.actionItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          item.completed
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                            : 'bg-slate-900/80 border-slate-800 text-slate-200'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            item.completed ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                        <div className="space-y-0.5">
                          <div>{item.text}</div>
                          <div className="text-[10px] text-slate-500">
                            Assignee: <span className="text-brand-400">{item.assignee}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">Select a Meeting</div>
              <div className="text-xs text-slate-500 max-w-sm mx-auto">
                Click on any session in the list to inspect its AI summary, key decisions, and action items.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
