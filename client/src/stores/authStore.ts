import { create } from 'zustand'
import { DEFAULT_USER } from '../utils/constants'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatarUrl: string
}

interface AuthState {
  user: UserProfile
  workspaceName: string
  organizationName: string
  setUserName: (name: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_USER,
  workspaceName: 'Engineering Sprint Workspace',
  organizationName: 'Enterprise Cloud Inc.',
  setUserName: (name: string) =>
    set((state) => ({ user: { ...state.user, name } })),
}))
