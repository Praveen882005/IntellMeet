import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mic,
  MicOff,
  Video,
  Video as VideoIcon,
  VideoOff,
  Clock,
  MonitorUp,
  MessageSquare,
  Sparkles,
  PhoneOff,
  Send,
  Users,
  Copy,
  CheckCircle2,
  Check,
  Captions,
  Loader2,
  ListTodo,
  Info,
  Shield,
  FileText,
  Radio,
  Maximize2,
  MoreVertical,
  Volume2,
  VolumeX,
  Search,
  Lock,
  ChevronDown,
  Circle,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { useSocket } from '../../hooks/useSocket'
import { useWebRTC } from '../../hooks/useWebRTC'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useMeetingStore } from '../../stores/meetingStore'
import { useAuthStore } from '../../stores/authStore'
import { aiService } from '../../services/aiService'
import { meetingService } from '../../services/meetingService'
import { ChatMessage } from '../../types'

export const MeetingRoomPage: React.FC = () => {
  const { roomId = 'sprint-room' } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const user = useAuthStore((s) => s.user)

  // Store state
  const {
    isMicOn,
    isCamOn,
    isScreenSharing,
    isTranscribing,
    activeSideTab,
    messages,
    transcripts,
    liveSubtitle,
    liveSubtitleSpeaker,
    actionItems,
    participantsCount,
    setRoomId,
    toggleMic,
    toggleCam,
    toggleTranscribing,
    setActiveSideTab,
    addMessage,
    setActionItems,
    toggleActionItem,
    setParticipantsCount,
    resetMeetingState,
  } = useMeetingStore()

  // Local state
  const [copiedLink, setCopiedLink] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [keyDecisions, setKeyDecisions] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [meetingSeconds, setMeetingSeconds] = useState(0)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [activeSpeaker, setActiveSpeaker] = useState<string>(user.name)
  const [transcriptSearch, setTranscriptSearch] = useState('')

  // Simulated peer participants in room
  const [peers, setPeers] = useState([
    {
      id: 'peer_1',
      name: 'David Miller',
      role: 'Co-Host',
      isMuted: false,
      isCamOn: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'peer_2',
      name: 'Elena Rostova',
      role: 'Participant',
      isMuted: true,
      isCamOn: false,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
  ])

  // WebRTC & Speech Recognition Hooks
  const {
    localStream,
    screenStream,
    localVideoRef,
    screenVideoRef,
    deviceError,
    initMedia,
    toggleScreenShare,
  } = useWebRTC()

  useSpeechRecognition(roomId)

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // Meeting Duration Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingSeconds((sec) => sec + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format Duration HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Socket room joining and listeners
  useEffect(() => {
    setRoomId(roomId)
    initMedia()

    if (socket && roomId) {
      socket.emit('join-room', {
        roomId,
        userName: user.name,
        userId: user.id,
      })

      socket.on('user-joined', (data: { userName: string }) => {
        addMessage({
          id: `sys_${Date.now()}`,
          sender: 'IntellMeet Hub',
          text: `${data.userName} joined the meeting.`,
          isSystem: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        setParticipantsCount(participantsCount + 1)
      })

      socket.on('receive-message', (msg: ChatMessage) => {
        addMessage(msg)
      })

      socket.on('user-left', (data: { userName: string }) => {
        addMessage({
          id: `sys_${Date.now()}`,
          sender: 'IntellMeet Hub',
          text: `${data.userName || 'A participant'} left the meeting.`,
          isSystem: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      })
    }

    return () => {
      if (socket) {
        socket.emit('leave-room', { roomId })
        socket.off('user-joined')
        socket.off('receive-message')
        socket.off('user-left')
      }
      resetMeetingState()
    }
  }, [roomId, socket, user.name, user.id])

  // Scroll to bottom on new chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send Chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !socket) return

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: user.name,
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    socket.emit('send-message', {
      roomId,
      message: newMsg,
    })

    setMessageInput('')
  }

  // Copy meeting invite link
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Autonomous AI Summarization Trigger
  const handleGenerateSummary = async () => {
    setIsGeneratingAi(true)
    try {
      const result = await aiService.summarize({
        roomName: roomId,
        transcript: transcripts,
        messages: messages,
      })

      setAiSummary(result.executiveSummary || result.summary)
      setKeyDecisions(result.keyDecisions || [])
      setActionItems(result.actionItems || [])
      setActiveSideTab('ai')
    } catch (err: unknown) {
      console.error('AI summary error:', err)
    } finally {
      setIsGeneratingAi(false)
    }
  }

  // End Meeting & Save to MongoDB
  const handleConfirmLeave = async (endForAll = false) => {
    try {
      await meetingService.saveMeeting({
        roomId,
        title: `Session: ${roomId}`,
        hostName: user.name,
        participants: [user.name, ...peers.map((p) => p.name)],
        summary: aiSummary || 'Session concluded with live peer streaming.',
        keyDecisions,
        actionItems,
      })
    } catch {
      // Gracefully navigate
    }
    setLeaveModalOpen(false)
    navigate('/app/history')
  }

  return (
    <div className="h-screen w-screen bg-[#0B0F19] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* 1. Studio Top Status Bar */}
      <header className="h-14 bg-[#101828]/90 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-white">
                Intell<span className="text-[#60A5FA]">Meet</span>
              </span>
              <span className="text-white/40">/</span>
              <span className="text-xs font-semibold text-slate-200">
                {roomId}
              </span>
              <span className="bg-white/10 text-[#60A5FA] border border-white/10 text-[10px] font-mono px-2 py-0.5 rounded">
                E2EE
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Timer & Recording Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>{formatDuration(meetingSeconds)}</span>
          </div>

          {isRecording && (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-xs px-2.5 py-1 rounded-full font-semibold animate-pulse">
              <Circle className="w-2 h-2 fill-current" />
              <span>REC</span>
            </div>
          )}
        </div>

        {/* Right Header CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-[#12B76A]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedLink ? 'Link Copied' : 'Invite'}</span>
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingAi}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white shadow-subtle transition-colors disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
            )}
            <span>AI Minutes</span>
          </button>
        </div>
      </header>

      {/* 2. Main Stage & Video Mesh Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Main Video Stage */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between overflow-hidden relative">
          {/* Active Screen Sharing Pinned View OR Participant Grid */}
          {isScreenSharing ? (
            <div className="flex-1 flex flex-col gap-3 min-h-0">
              {/* Screen Stream Hero */}
              <div className="flex-1 rounded-2xl bg-black border border-white/10 relative overflow-hidden flex items-center justify-center">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2">
                  <MonitorUp className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>You are sharing your screen</span>
                </div>
              </div>

              {/* Strip of participants below screen */}
              <div className="h-32 flex gap-3 overflow-x-auto shrink-0 pb-1">
                {/* Local Camera Tile */}
                <div className="w-48 h-full rounded-xl bg-[#111827] border border-white/10 relative overflow-hidden shrink-0">
                  {isCamOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      Camera Off
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white">
                    You
                  </div>
                </div>

                {/* Peer Tiles */}
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="w-48 h-full rounded-xl bg-[#111827] border border-white/10 relative overflow-hidden shrink-0"
                  >
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white">
                      {peer.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Standard Dynamic Video Grid (1, 2, 3, 4 participants) */
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 min-h-0">
              {/* 1. Local User Video Tile */}
              <div
                className={`rounded-2xl bg-[#111827] relative overflow-hidden flex items-center justify-center shadow-lg transition-all ${
                  activeSpeaker === user.name
                    ? 'border-2 border-[#12B76A] ring-2 ring-[#12B76A]/20'
                    : 'border border-white/10'
                }`}
              >
                {isCamOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div className="text-xs font-medium text-slate-300">
                      {user.name} (Camera Off)
                    </div>
                  </div>
                )}

                {/* Top Badge: Active Speaker */}
                {activeSpeaker === user.name && (
                  <div className="absolute top-3 left-3 bg-[#12B76A]/90 text-black px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                    Speaking
                  </div>
                )}

                {/* Bottom Bar: Name & Mic indicator */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2">
                    <span>{user.name} (You)</span>
                  </div>

                  <div className="bg-black/80 p-1.5 rounded-lg text-white">
                    {isMicOn ? (
                      <Mic className="w-3.5 h-3.5 text-[#12B76A]" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-[#F04438]" />
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Peer Participant Tile 1 */}
              <div className="rounded-2xl bg-[#111827] border border-white/10 relative overflow-hidden flex items-center justify-center shadow-lg">
                <img
                  src={peers[0].avatar}
                  alt={peers[0].name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="bg-black/80 px-2.5 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2">
                    <span>{peers[0].name}</span>
                    <Badge variant="primary" size="sm">
                      {peers[0].role}
                    </Badge>
                  </div>
                  <div className="bg-black/80 p-1.5 rounded-lg text-white">
                    <Mic className="w-3.5 h-3.5 text-[#12B76A]" />
                  </div>
                </div>
              </div>

              {/* 3. Peer Participant Tile 2 */}
              <div className="rounded-2xl bg-[#111827] border border-white/10 relative overflow-hidden flex items-center justify-center shadow-lg">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <img
                    src={peers[1].avatar}
                    alt={peers[1].name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10"
                  />
                  <div className="text-xs font-medium text-slate-300">
                    {peers[1].name} (Audio Only)
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="bg-black/80 px-2.5 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-2">
                    <span>{peers[1].name}</span>
                  </div>
                  <div className="bg-black/80 p-1.5 rounded-lg text-white">
                    <MicOff className="w-3.5 h-3.5 text-[#F04438]" />
                  </div>
                </div>
              </div>

              {/* 4. AI Meeting Intelligence Observer Tile */}
              <div className="rounded-2xl bg-[#101828] border border-[#2563EB]/40 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#60A5FA]">
                  <Sparkles className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">
                    IntellMeet AI Assistant
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Live speech-to-text active. Summarizing discussion and extracting action items.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#12B76A]/10 text-[#12B76A] border border-[#12B76A]/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                  Recording & Transcribing
                </div>
              </div>
            </div>
          )}

          {/* Device Error Notification */}
          {deviceError && (
            <div className="absolute top-4 left-4 right-4 bg-amber-950/90 border border-amber-800 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{deviceError}</span>
            </div>
          )}

          {/* Spoken Subtitle Overlay (Live SpeechRecognition) */}
          {isTranscribing && liveSubtitle && (
            <div className="absolute bottom-20 left-6 right-6 flex justify-center pointer-events-none">
              <div className="max-w-2xl bg-black/85 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl shadow-2xl text-center space-y-0.5 animate-fade-in">
                <div className="text-[10px] font-semibold text-[#60A5FA] uppercase tracking-wider flex items-center justify-center gap-1">
                  <Captions className="w-3 h-3" />
                  {liveSubtitleSpeaker || user.name}
                </div>
                <div className="text-sm text-slate-100 font-medium leading-relaxed">
                  "{liveSubtitle}"
                </div>
              </div>
            </div>
          )}

          {/* 3. Floating Bottom Control Dock */}
          <div className="h-16 bg-[#101828]/95 border border-white/10 rounded-2xl px-4 flex items-center justify-between shadow-2xl mt-3 shrink-0">
            {/* Left Controls: Mic & Camera */}
            <div className="flex items-center gap-2">
              {/* Mic Button */}
              <button
                onClick={toggleMic}
                className={`p-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  isMicOn
                    ? 'bg-white/10 hover:bg-white/15 text-white'
                    : 'bg-[#F04438] text-white shadow-lg'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden md:inline">{isMicOn ? 'Mute' : 'Unmute'}</span>
              </button>

              {/* Camera Button */}
              <button
                onClick={toggleCam}
                className={`p-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  isCamOn
                    ? 'bg-white/10 hover:bg-white/15 text-white'
                    : 'bg-[#F04438] text-white shadow-lg'
                }`}
              >
                {isCamOn ? (
                  <VideoIcon className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
                <span className="hidden md:inline">{isCamOn ? 'Stop Video' : 'Start Video'}</span>
              </button>
            </div>

            {/* Center Controls: Screen share, Recording, Captions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  isScreenSharing
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <MonitorUp className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isScreenSharing ? 'Stop Share' : 'Share Screen'}
                </span>
              </button>

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isRecording ? 'Recording' : 'Record'}
                </span>
              </button>

              <button
                onClick={toggleTranscribing}
                className={`p-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  isTranscribing
                    ? 'bg-[#2563EB]/20 text-[#60A5FA] border border-[#2563EB]/40'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <Captions className="w-4 h-4" />
                <span className="hidden sm:inline">Captions</span>
              </button>
            </div>

            {/* Right Controls: Panels toggle & Leave */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSideTab(activeSideTab === 'participants' ? 'chat' : 'participants')}
                className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSideTab === 'participants'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">{peers.length + 1}</span>
              </button>

              <button
                onClick={() => setActiveSideTab(activeSideTab === 'chat' ? 'ai' : 'chat')}
                className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSideTab === 'chat'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {messages.length > 0 && (
                  <span className="bg-[#2563EB] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {messages.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSideTab('ai')}
                className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSideTab === 'ai'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#60A5FA]" />
                <span className="hidden md:inline">AI Panel</span>
              </button>

              <button
                onClick={() => setLeaveModalOpen(true)}
                className="bg-[#F04438] hover:bg-[#D92D20] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-all ml-1"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Right Side Drawer: Chat, Participants, or AI Minutes */}
        <div className="w-80 sm:w-96 bg-[#101828] border-l border-white/10 flex flex-col shrink-0">
          {/* Drawer Top Navigation Header */}
          <div className="h-14 border-b border-white/10 px-3 flex items-center justify-between bg-black/20">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveSideTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSideTab === 'chat'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>

              <button
                onClick={() => setActiveSideTab('participants')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSideTab === 'participants'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                People ({peers.length + 1})
              </button>

              <button
                onClick={() => setActiveSideTab('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSideTab === 'ai'
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                AI
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Panel 1: Chat */}
            {activeSideTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 dark-scroll">
                  {messages.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-500">
                      No chat messages yet. Say hello to the room!
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`space-y-1 ${
                          m.isSystem
                            ? 'text-center my-2'
                            : m.sender === user.name
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {m.isSystem ? (
                          <span className="inline-block text-[11px] px-3 py-1 rounded-full bg-white/10 text-slate-300">
                            {m.text}
                          </span>
                        ) : (
                          <div>
                            <div className="text-[10px] text-slate-400">
                              {m.sender} • {m.timestamp}
                            </div>
                            <div
                              className={`inline-block px-3.5 py-2 rounded-2xl text-xs max-w-[85%] text-left ${
                                m.sender === user.name
                                  ? 'bg-[#2563EB] text-white rounded-br-none'
                                  : 'bg-[#182235] text-slate-200 rounded-bl-none border border-white/5'
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Send Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-white/10 bg-black/20 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Send a message to room..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 rounded-xl bg-[#182235] border border-white/10 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!messageInput.trim()}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    Send
                  </Button>
                </form>
              </div>
            )}

            {/* Panel 2: Participant Management */}
            {activeSideTab === 'participants' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 dark-scroll">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                  <span>In Meeting ({peers.length + 1})</span>
                  <button className="text-[#60A5FA] font-medium hover:underline">
                    Mute All
                  </button>
                </div>

                {/* Host (Current User) */}
                <div className="p-3 rounded-xl bg-[#182235] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">{user.name} (You)</div>
                      <div className="text-[10px] text-[#60A5FA]">Meeting Host</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    {isMicOn ? <Mic className="w-3.5 h-3.5 text-[#12B76A]" /> : <MicOff className="w-3.5 h-3.5 text-[#F04438]" />}
                    {isCamOn ? <VideoIcon className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-slate-500" />}
                  </div>
                </div>

                {/* Other Peers */}
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="p-3 rounded-xl bg-[#182235]/60 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{peer.name}</div>
                        <div className="text-[10px] text-slate-400">{peer.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        title="Toggle mute for participant"
                        className="p-1.5 rounded bg-black/40 text-slate-300 hover:text-white"
                      >
                        {peer.isMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-[#F04438]" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-[#12B76A]" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Panel 3: AI Intelligence & Minutes */}
            {activeSideTab === 'ai' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5 dark-scroll text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                    Autonomous Intelligence
                  </div>
                  <Button
                    variant="primary"
                    size="xs"
                    loading={isGeneratingAi}
                    onClick={handleGenerateSummary}
                  >
                    Refresh AI
                  </Button>
                </div>

                {/* Executive Summary */}
                <div className="space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />
                    Executive Summary
                  </div>
                  <div className="p-3 rounded-xl bg-[#182235] border border-white/10 text-slate-300 leading-relaxed text-xs">
                    {aiSummary ||
                      'AI summary will update automatically as discussions proceed. Click "Refresh AI" to extract current progress.'}
                  </div>
                </div>

                {/* Key Decisions */}
                {keyDecisions.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-[#12B76A] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Key Decisions ({keyDecisions.length})
                    </div>
                    <ul className="space-y-1.5">
                      {keyDecisions.map((dec, idx) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-[#182235] border border-white/5 text-slate-200 flex items-start gap-2">
                          <span className="text-[#12B76A] font-bold">•</span>
                          <span>{dec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {actionItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-[#F79009] flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5" />
                      Action Items ({actionItems.length})
                    </div>
                    <div className="space-y-1.5">
                      {actionItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleActionItem(item.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                            item.completed
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                              : 'bg-[#182235] border-white/10 text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-700 text-[#2563EB]"
                          />
                          <div className="space-y-0.5">
                            <div>{item.text}</div>
                            <div className="text-[10px] text-[#60A5FA]">
                              Owner: {item.assignee}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Meeting Confirmation Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Leave Meeting?"
        description="Are you sure you want to exit the collaboration room?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#667085] leading-relaxed">
            Your attendance log and generated AI summary will be automatically saved to your workspace meeting history.
          </p>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLeaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleConfirmLeave(false)}
            >
              Leave Room
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleConfirmLeave(true)}
            >
              End for All & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
