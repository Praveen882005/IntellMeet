import { create } from 'zustand'
import { DEFAULT_USER } from '../utils/constants'
import { authService, AuthUser } from '../services/authService'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatarUrl: string
  status?: string
  organizationId?: string
  workspaceId?: string
}

interface AuthState {
  user: UserProfile
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  workspaceName: string
  organizationName: string
  setUserName: (name: string) => void
  setUser: (user: Partial<UserProfile>) => void
  setAccessToken: (token: string | null) => void
  initAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: DEFAULT_USER.id,
    name: DEFAULT_USER.name,
    email: DEFAULT_USER.email,
    role: DEFAULT_USER.role,
    avatarUrl: DEFAULT_USER.avatarUrl,
    status: 'active',
  },
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: Boolean(localStorage.getItem('access_token')),
  isLoading: false,
  workspaceName: 'Engineering Sprint Workspace',
  organizationName: 'Enterprise Cloud Inc.',

  setUserName: (name: string) =>
    set((state) => ({ user: { ...state.user, name } })),

  setUser: (updatedUser: Partial<UserProfile>) =>
    set((state) => ({
      user: { ...state.user, ...updatedUser },
      isAuthenticated: true,
    })),

  setAccessToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('access_token', token)
      set({ accessToken: token, isAuthenticated: true })
    } else {
      localStorage.removeItem('access_token')
      set({ accessToken: null, isAuthenticated: false })
    }
  },

  initAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    set({ isLoading: true })
    try {
      const me = await authService.getMe()
      if (me) {
        set({
          user: {
            id: me.id,
            name: me.name,
            email: me.email,
            role: me.role,
            avatarUrl: me.avatarUrl || DEFAULT_USER.avatarUrl,
            status: me.status || 'active',
            organizationId: me.organizationId,
            workspaceId: me.workspaceId,
          },
          isAuthenticated: true,
        })
      }
    } catch {
      // If token expired and refresh fails, reset auth state
      localStorage.removeItem('access_token')
      set({ accessToken: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      set({
        accessToken: null,
        isAuthenticated: false,
        user: {
          id: '',
          name: 'Guest User',
          email: '',
          role: 'guest',
          avatarUrl: DEFAULT_USER.avatarUrl,
          status: 'offline',
        },
      })
    }
  },
}))
