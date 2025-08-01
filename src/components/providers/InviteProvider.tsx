'use client'

import type { User } from '@supabase/supabase-js'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { processAllPendingInvites } from '@/lib/database/organization-users'

interface InviteProviderProps {
  children: React.ReactNode
  user: User | null
}

export function InviteProvider({ children, user }: InviteProviderProps) {
  const hasProcessedInvites = useRef(false)

  useEffect(() => {
    if (user && !hasProcessedInvites.current) {
      hasProcessedInvites.current = true
      const processInvites = async () => {
        try {
          const processedCount = await processAllPendingInvites(
            user.email!,
            user.id
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
      processInvites()
    }
  }, [user])

  return <>{children}</>
}
