'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/hooks/useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
  }

  useEffect(() => {
    if (!(loading || user)) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <>
      {user && (
        <Header
          onSignOut={handleSignOut}
          userAvatar={user.user_metadata?.avatar_url}
          userEmail={user.email || ''}
        />
      )}
      {children}
    </>
  )
}
