import React, { useState } from 'react'
import {
  Settings,
  User,
  Sliders,
  Sparkles,
  Shield,
  CreditCard,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'
import { useAuthStore } from '../../stores/authStore'

export const SettingsPage: React.FC = () => {
  const { user, workspaceName, organizationName, setUserName } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [savedFeedback, setSavedFeedback] = useState(false)

  // Media preferences
  const [defaultMic, setDefaultMic] = useState(true)
  const [defaultCam, setDefaultCam] = useState(true)
  const [language, setLanguage] = useState('en-US')

  // AI settings
  const [openAiKey, setOpenAiKey] = useState('')
  const [retentionDays, setRetentionDays] = useState('90')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setUserName(name)
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-[#EAECF0]">
        <h1 className="font-heading text-2xl font-bold text-[#101828]">Settings</h1>
        <p className="text-xs text-[#667085] mt-0.5">
          Manage your account profile, video hardware defaults, AI engine parameters, and security policies.
        </p>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
          { id: 'media', label: 'Audio & Video', icon: <Sliders className="w-4 h-4" /> },
          { id: 'ai', label: 'AI Intelligence', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'security', label: 'Security & SSO', icon: <Shield className="w-4 h-4" /> },
          { id: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-4 h-4" /> },
        ]}
      />

      {savedFeedback && (
        <div className="p-3 bg-[#ECFDF3] border border-[#A6F4C5] rounded-xl text-xs text-[#027A48] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="space-y-6">
          <h3 className="font-heading font-semibold text-sm text-[#101828]">
            Personal Profile Information
          </h3>

          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#EAECF0]"
            />
            <div>
              <Button variant="secondary" size="xs">
                Change Avatar
              </Button>
              <div className="text-[11px] text-[#667085] mt-1">
                JPG, GIF or PNG. Max size 2MB.
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Audio & Video Tab */}
      {activeTab === 'media' && (
        <Card className="space-y-6">
          <h3 className="font-heading font-semibold text-sm text-[#101828]">
            Hardware & Speech Recognition Defaults
          </h3>

          <div className="space-y-4 max-w-lg">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] hover:bg-[#F8FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={defaultMic}
                onChange={(e) => setDefaultMic(e.target.checked)}
                className="rounded border-[#D0D5DD] text-[#2563EB]"
              />
              <div className="text-xs">
                <div className="font-medium text-[#101828]">Enable microphone by default</div>
                <div className="text-[#667085]">Microphone will be unmuted when entering meeting rooms</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-[#EAECF0] hover:bg-[#F8FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={defaultCam}
                onChange={(e) => setDefaultCam(e.target.checked)}
                className="rounded border-[#D0D5DD] text-[#2563EB]"
              />
              <div className="text-xs">
                <div className="font-medium text-[#101828]">Enable camera by default</div>
                <div className="text-[#667085]">Video stream will be active immediately upon entry</div>
              </div>
            </label>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-[#344054]">
                Live Speech Recognition Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-xs text-[#101828] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="en-US">English (United States)</option>
                <option value="en-GB">English (United Kingdom)</option>
                <option value="es-ES">Spanish (Español)</option>
                <option value="fr-FR">French (Français)</option>
                <option value="de-DE">German (Deutsch)</option>
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSavedFeedback(true)
                setTimeout(() => setSavedFeedback(false), 2000)
              }}
            >
              Update Media Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
            <div>
              <h3 className="font-heading font-semibold text-sm text-[#101828]">
                AI Intelligence & LLM Configurations
              </h3>
              <p className="text-xs text-[#667085]">
                Configure external LLM providers or use our built-in contextual NLP engine.
              </p>
            </div>
            <Badge variant="primary" size="sm">
              Built-in Active
            </Badge>
          </div>

          <div className="space-y-4 max-w-lg">
            <Input
              label="OpenAI API Key (Optional Override)"
              type="password"
              placeholder="sk-proj-••••••••"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              helperText="Leave empty to use IntellMeet's zero-cost on-device natural language engine."
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-[#344054]">
                Transcript Retention Period
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-xs text-[#101828] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="30">30 days retention</option>
                <option value="90">90 days retention (Recommended)</option>
                <option value="365">1 year retention</option>
                <option value="indefinite">Indefinite (Enterprise)</option>
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSavedFeedback(true)
                setTimeout(() => setSavedFeedback(false), 2000)
              }}
            >
              Save AI Settings
            </Button>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="space-y-6">
          <h3 className="font-heading font-semibold text-sm text-[#101828]">
            Enterprise Security & Access Governance
          </h3>

          <div className="space-y-4 max-w-lg text-xs">
            <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#101828]">SAML 2.0 Single Sign-On (SSO)</div>
                <div className="text-[#667085]">Enforce Okta or Azure AD authentication for all workspace members.</div>
              </div>
              <Badge variant="success" size="sm">
                Configured
              </Badge>
            </div>

            <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#101828]">Two-Factor Authentication (2FA)</div>
                <div className="text-[#667085]">Require authenticator apps (TOTP) on login.</div>
              </div>
              <Badge variant="primary" size="sm">
                Enforced
              </Badge>
            </div>

            <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#101828]">End-to-End Media Encryption (E2EE)</div>
                <div className="text-[#667085]">Direct DTLS-SRTP WebRTC peer encryption active.</div>
              </div>
              <Badge variant="success" size="sm">
                Enabled
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
            <div>
              <h3 className="font-heading font-semibold text-sm text-[#101828]">
                Subscription Tier
              </h3>
              <p className="text-xs text-[#667085]">You are currently on the Enterprise Pro tier.</p>
            </div>
            <Badge variant="primary" size="md">
              Pro Tier ($15/seat)
            </Badge>
          </div>

          <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] max-w-lg text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#667085]">Current Seats:</span>
              <span className="font-semibold text-[#101828]">4 active members</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Next Billing Date:</span>
              <span className="font-semibold text-[#101828]">November 30, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Payment Method:</span>
              <span className="font-medium text-[#101828]">MasterCard ending in •••• 4242</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
