import type { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { processAllPendingInvites } from '@/lib/database/organization-users'
import { supabase } from '@/lib/supabase-client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const processInvitesNonBlocking = useCallback(
    async (currentUser: User | null) => {
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
    },
    []
  )

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)

      // Processar convites de forma não-bloqueante
      if (data.user) {
        processInvitesNonBlocking(data.user)
      }
    }

    getUser()

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)

      // Processar convites apenas quando o usuário faz login (SIGNED_IN)
      if (currentUser && event === 'SIGNED_IN') {
        processInvitesNonBlocking(currentUser)
      }
    })

    return () => subscription.unsubscribe()
  }, [processInvitesNonBlocking])

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
