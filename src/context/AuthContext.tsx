import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthState, SignupInput } from '../lib/authLocal'
import { clearSession, loadSession, loginLocal, signupLocal } from '../lib/authLocal'

type AuthContextValue = {
  auth: AuthState
  signup: (input: SignupInput) => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    userId: null,
    username: null,
    name: null,
    nickname: null,
    address: null
  })

  useEffect(() => {
    setAuth(loadSession())
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    auth,
    signup: async (input: SignupInput) => {
      const session = signupLocal(input)
      setAuth(session)
    },
    login: async (username: string, password: string) => {
      const session = loginLocal(username, password)
      setAuth(session)
    },
    logout: () => {
      clearSession()
      setAuth({
        userId: null,
        username: null,
        name: null,
        nickname: null,
        address: null
      })
    }
  }), [auth])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
