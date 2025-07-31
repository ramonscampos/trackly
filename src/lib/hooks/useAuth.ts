import type { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { processAllPendingInvites } from '@/lib/database/organization-users'
import { supabase } from '@/lib/supabase-client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const processInvites = useCallback(async (currentUser: User | null) => {
    if (currentUser?.email) {
      try {
        const processedCount = await processAllPendingInvites(
          currentUser.email,
          currentUser.id
        )
        if (processedCount > 0) {
          toast.success(
            `Você foi adicionado a ${processedCount} organização${processedCount > 1 ? 's' : ''}!`
          )
        }
      } catch (error) {
        console.error('Erro ao processar convites:', error)
        toast.error('Erro ao processar convites pendentes')
      }
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        await processInvites(data.user)
      }
      setLoading(false)
    }

    getUser()

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await processInvites(currentUser)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [processInvites])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}
