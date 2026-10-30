import React, { useState } from 'react'
import {
  Layers,
  Users,
  UserPlus,
  Shield,
  Search,
  MoreVertical,
  Mail,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../stores/authStore'

export const WorkspacePage: React.FC = () => {
  const { workspaceName } = useAuthStore()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [searchQuery, setSearchQuery] = useState('')

  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah@company.com',
      role: 'Owner',
      status: 'Active',
      joined: 'Oct 2026',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 2,
      name: 'David Miller',
      email: 'david@company.com',
      role: 'Admin',
      status: 'Active',
      joined: 'Oct 2026',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 3,
      name: 'Elena Rostova',
      email: 'elena@company.com',
      role: 'Member',
      status: 'Active',
      joined: 'Oct 2026',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 4,
      name: 'Marcus Vance',
      email: 'marcus@company.com',
      role: 'Member',
      status: 'Invited',
      joined: 'Pending',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    },
  ])

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteEmail) {
      setMembers([
        ...members,
        {
          id: Date.now(),
          name: inviteEmail.split('@')[0],
          email: inviteEmail,
          role: inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1),
          status: 'Invited',
          joined: 'Pending',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
        },
      ])
      setInviteEmail('')
      setInviteModalOpen(false)
    }
  }

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAECF0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-[#101828]">
              {workspaceName}
            </h1>
            <Badge variant="success" size="sm">
              Enterprise Workspace
            </Badge>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage team members, roles, permissions, and departmental collaboration channels.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setInviteModalOpen(true)}
        >
          Invite Member
        </Button>
      </div>

      {/* Member Search & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="text-xs text-[#667085] font-medium">
          {members.length} team members total
        </div>
      </div>

      {/* Members Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#EAECF0] text-[#667085] uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#EAECF0]"
                    />
                    <div>
                      <div className="font-semibold text-[#101828]">{member.name}</div>
                      <div className="text-[11px] text-[#667085]">{member.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        member.role === 'Owner'
                          ? 'navy'
                          : member.role === 'Admin'
                          ? 'primary'
                          : 'gray'
                      }
                      size="sm"
                    >
                      {member.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        member.status === 'Active' ? 'text-[#12B76A]' : 'text-[#F79009]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'Active' ? 'bg-[#12B76A]' : 'bg-[#F79009]'
                        }`}
                      />
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#667085]">{member.joined}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-[#98A2B3] hover:text-[#101828] p-1 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite New Colleague"
        description="Send an invitation to join this workspace."
      >
        <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-[#344054]">
              Workspace Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-xs text-[#101828] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="member">Member (Can host & join meetings)</option>
              <option value="admin">Admin (Can manage workspace settings)</option>
              <option value="guest">Guest (Can join assigned rooms only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
