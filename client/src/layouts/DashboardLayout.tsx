import React, { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  History,
  Layers,
  Sparkles,
  CheckSquare,
  Film,
  Settings,
  Video,
  Search,
  Bell,
  Plus,
  LogOut,
  ChevronDown,
  Building2,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/authStore'
import { useSocket } from '../hooks/useSocket'

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, workspaceName, organizationName } = useAuthStore()
  const { isConnected } = useSocket()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [joinRoomCode, setJoinRoomCode] = useState('')

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/app' },
    { label: 'My Meetings', icon: Calendar, path: '/app/meetings' },
    { label: 'Schedule Meeting', icon: CalendarPlus, path: '/app/schedule' },
    { label: 'Meeting History', icon: History, path: '/app/history' },
    { label: 'Team Workspace', icon: Layers, path: '/app/workspace' },
    { label: 'AI Insights', icon: Sparkles, path: '/app/insights', badge: 'AI' },
    { label: 'Tasks & Action Items', icon: CheckSquare, path: '/app/tasks' },
    { label: 'Recordings', icon: Film, path: '/app/recordings' },
    { label: 'Settings', icon: Settings, path: '/app/settings' },
  ]

  const handleStartInstantMeeting = () => {
    const randomRoom = `meet-${Math.random().toString(36).substring(2, 8)}`
    navigate(`/room/${randomRoom}`)
  }

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinRoomCode.trim()) {
      setJoinModalOpen(false)
      navigate(`/room/${joinRoomCode.trim().toLowerCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#101828]">
      {/* 1. Navy Desktop Sidebar (#101828) */}
      <aside className="w-64 bg-[#101828] text-white flex-col justify-between hidden lg:flex shrink-0 border-r border-[#182235]">
        <div className="space-y-6 p-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-subtle">
              <Video className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg text-white">
                Intell<span className="text-[#60A5FA]">Meet</span>
              </span>
              <span className="text-[9px] font-semibold bg-[#2563EB]/20 text-[#60A5FA] px-1.5 py-0.5 rounded border border-[#2563EB]/40">
                PRO
              </span>
            </div>
          </Link>

          {/* Organization / Workspace Selector */}
          <div className="bg-[#182235] p-2.5 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#98A2B3]">
              <span>ACTIVE WORKSPACE</span>
              <Building2 className="w-3.5 h-3.5 text-[#60A5FA]" />
            </div>
            <div className="text-xs font-semibold text-white truncate">
              {workspaceName}
            </div>
            <div className="text-[10px] text-[#98A2B3] truncate">
              {organizationName}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isExactActive =
                item.path === '/app'
                  ? location.pathname === '/app'
                  : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isExactActive
                      ? 'bg-[#2563EB] text-white font-semibold shadow-subtle'
                      : 'text-[#98A2B3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/30 text-[9px] font-bold px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
              />
              <div className="text-left max-w-[120px]">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-[#98A2B3] truncate">{user.email}</div>
              </div>
            </div>
            <Link to="/login" title="Sign out" className="text-[#98A2B3] hover:text-white p-1">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#98A2B3] pt-1">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-[#12B76A]' : 'bg-[#F79009]'
                }`}
              />
              {isConnected ? 'Mesh Connected' : 'Connecting...'}
            </span>
            <span className="font-mono text-[10px]">v2.0.0</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#EAECF0] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#667085] hover:bg-[#F2F4F7]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Global Search Bar */}
            <div className="hidden sm:flex items-center gap-2 bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg px-3 py-1.5 text-xs text-[#667085] w-64 md:w-80">
              <Search className="w-3.5 h-3.5 text-[#98A2B3]" />
              <input
                type="text"
                placeholder="Search meetings, transcripts, tasks (⌘K)..."
                className="bg-transparent text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJoinModalOpen(true)}
            >
              Join with Code
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleStartInstantMeeting}
            >
              New Meeting
            </Button>

            <div className="h-6 w-px bg-[#EAECF0] mx-1" />

            <button className="p-2 rounded-lg text-[#667085] hover:bg-[#F2F4F7] relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#101828] text-white p-4 space-y-4 border-b border-[#182235]">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#98A2B3] hover:text-white hover:bg-white/5"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Join Meeting by Code Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join Meeting by Code"
        description="Enter the meeting room code or invite link to connect directly."
      >
        <form onSubmit={handleJoinByCode} className="space-y-4 pt-2">
          <Input
            label="Room Code"
            placeholder="e.g. sprint-q4 or 123-abc"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setJoinModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!joinRoomCode.trim()}
            >
              Join Meeting
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
