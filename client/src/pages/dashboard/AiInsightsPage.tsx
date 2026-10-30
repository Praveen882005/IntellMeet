import React, { useState } from 'react'
import {
  Sparkles,
  Search,
  MessageSquare,
  FileText,
  CheckCircle2,
  Shield,
  Send,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'

export const AiInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am IntellMeet AI. You can ask me anything about your team discussions, extracted action items, or architectural decisions.',
    },
  ])

  // Sample structured meeting intelligence
  const sampleData = {
    title: 'Sprint Q4 Architecture & Security Review',
    date: 'Oct 30, 2026',
    duration: '42 mins',
    executiveSummary:
      'The engineering leadership concluded migration to Socket.io and native WebRTC mesh streaming. The team established 12 Mongoose database models with automated in-memory fallback persistence to guarantee zero downtime in test and development environments. All security protocols were aligned for SOC-2 Type II audit readiness.',
    keyDecisions: [
      'Confirmed #2563EB primary enterprise palette and dual light dashboard / dark meeting room theme.',
      'Adopted on-device HTML5 SpeechRecognition to eliminate external streaming transcription latency and API costs.',
      'Validated in-memory session buffer fallback for MongoDB resilient failover.',
      'Scheduled regional media relay cluster deployment for Phase 3.',
    ],
    actionItems: [
      { text: 'Finalize WebRTC peer connection signaling pipeline', assignee: 'Engineering Team', priority: 'high', completed: true },
      { text: 'Verify multi-user room broadcasting and chat events', assignee: 'QA Lead', priority: 'medium', completed: true },
      { text: 'Deploy Phase 2 Enterprise UI release across all workspaces', assignee: 'Frontend Architect', priority: 'high', completed: false },
    ],
    transcripts: [
      { speaker: 'Sarah Chen', time: '14:02:10', text: 'Let us start by confirming the WebRTC signaling mesh and STUN server endpoints.' },
      { speaker: 'David Miller', time: '14:04:35', text: 'All signaling events for join, signal, and media state are active on Socket.io with zero dropouts.' },
      { speaker: 'Elena Rostova', time: '14:08:12', text: 'The on-device Web Speech API generates subtitles directly on the user client with 0ms backend delay.' },
      { speaker: 'Sarah Chen', time: '14:15:40', text: 'Approved. Let us verify the 12 Mongoose models and build the full enterprise design system.' },
    ],
  }

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return

    const userQ = aiQuestion
    setAiQuestion('')
    setAiChatHistory((prev) => [...prev, { role: 'user', text: userQ }])

    setTimeout(() => {
      let reply = `Based on the meeting transcript: Regarding "${userQ}", the team agreed to finalize the implementation using our approved architectural patterns and verified 0ms transcription latency.`
      if (userQ.toLowerCase().includes('decision')) {
        reply = 'The 4 major decisions confirmed in this meeting were: 1) Adopting the Modern Enterprise design system, 2) Zero-cost HTML5 Web Speech STT, 3) MongoDB resilient fallback store, and 4) Regional media relays.'
      } else if (userQ.toLowerCase().includes('who') || userQ.toLowerCase().includes('sarah')) {
        reply = 'Sarah Chen led the architecture review, approved the design system tokens, and validated the 12 Mongoose collection schemas.'
      }

      setAiChatHistory((prev) => [...prev, { role: 'assistant', text: reply }])
    }, 500)
  }

  const filteredTranscripts = sampleData.transcripts.filter(
    (t) =>
      t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAECF0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-[#101828]">
              AI Meeting Intelligence
            </h1>
            <Badge variant="primary" size="sm">
              <Sparkles className="w-3 h-3 text-[#2563EB]" /> AI Engine Active
            </Badge>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Deep contextual insights, automated minute generation, searchable transcripts, and natural language Q&A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            Sentiment: 94% Positive
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'summary', label: 'Executive Minutes', icon: <FileText className="w-4 h-4" /> },
          { id: 'transcript', label: 'Searchable Transcript', icon: <Search className="w-4 h-4" /> },
          { id: 'assistant', label: 'AI Meeting Assistant', icon: <Cpu className="w-4 h-4" /> },
        ]}
      />

      {/* TAB 1: Executive Minutes */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAECF0] pb-3">
              <div>
                <h2 className="font-heading text-base font-bold text-[#101828]">
                  {sampleData.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#667085] mt-0.5">
                  <span>{sampleData.date}</span>
                  <span>•</span>
                  <span>Duration: {sampleData.duration}</span>
                </div>
              </div>
              <Badge variant="primary" size="sm">
                Generated via OpenAI & Contextual NLP
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Executive Summary
              </h3>
              <p className="text-sm text-[#344054] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#EAECF0]">
                {sampleData.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[#EAECF0] bg-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#12B76A] uppercase tracking-wider">
                  <Shield className="w-4 h-4" /> Key Decisions (4)
                </div>
                <ul className="text-xs text-[#344054] space-y-2">
                  {sampleData.keyDecisions.map((decision, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#12B76A] font-bold mt-0.5">•</span>
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-[#EAECF0] bg-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Extracted Action Items
                </div>
                <div className="space-y-2 text-xs">
                  {sampleData.actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-[#EAECF0] bg-[#F8FAFC] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${item.completed ? 'text-[#12B76A]' : 'text-[#D0D5DD]'}`}
                        />
                        <span className={item.completed ? 'line-through text-[#98A2B3]' : 'text-[#101828]'}>
                          {item.text}
                        </span>
                      </div>
                      <Badge variant="primary" size="sm">
                        {item.assignee}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Searchable Transcript */}
      {activeTab === 'transcript' && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-semibold text-sm text-[#101828]">
                Interactive Spoken Transcript
              </h3>
              <p className="text-xs text-[#667085]">
                Filter by speaker or search keyword to review verbatim discussions.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dialogue words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredTranscripts.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#667085]">
                No dialogue matches found for "{searchQuery}".
              </div>
            ) : (
              filteredTranscripts.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] hover:bg-white hover:shadow-subtle transition-all flex items-start gap-4"
                >
                  <span className="font-mono text-[11px] text-[#2563EB] bg-[#EFF8FF] px-2 py-0.5 rounded border border-[#B2DDFF] shrink-0 mt-0.5">
                    {t.time}
                  </span>
                  <div className="space-y-1">
                    <span className="font-semibold text-xs text-[#101828]">{t.speaker}</span>
                    <p className="text-xs text-[#344054] leading-relaxed">{t.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: AI Assistant Interface */}
      {activeTab === 'assistant' && (
        <Card className="space-y-4">
          <div>
            <h3 className="font-heading font-semibold text-sm text-[#101828]">
              Ask IntellMeet Assistant
            </h3>
            <p className="text-xs text-[#667085]">
              Natural language queries over meeting minutes, transcripts, and assigned tasks.
            </p>
          </div>

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] space-y-3">
            {aiChatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-md ${
                    msg.role === 'user'
                      ? 'bg-[#2563EB] text-white rounded-br-none'
                      : 'bg-white border border-[#EAECF0] text-[#101828] rounded-bl-none shadow-subtle'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              onClick={() => setAiQuestion('What decisions were agreed upon?')}
              className="px-2.5 py-1 rounded-md border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F8FAFC]"
            >
              "What decisions were agreed upon?"
            </button>
            <button
              onClick={() => setAiQuestion('Who is responsible for the WebRTC pipeline?')}
              className="px-2.5 py-1 rounded-md border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F8FAFC]"
            >
              "Who is responsible for the WebRTC pipeline?"
            </button>
          </div>

          {/* Input Box */}
          <form onSubmit={handleAskAi} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about this meeting (e.g. 'What did Sarah say about deadlines?')..."
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="flex-1 rounded-lg border border-[#D0D5DD] px-3.5 py-2 text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#2563EB]"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!aiQuestion.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Ask
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
