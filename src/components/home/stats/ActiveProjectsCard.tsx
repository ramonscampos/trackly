'use client'

import { Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/common/StatCard'
import { getActiveProjectsCountByUserId } from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

export function ActiveProjectsCard() {
  const { user } = useAuth()
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0)
  const [activeOrganizationsCount, setActiveOrganizationsCount] =
    useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return

      setLoading(true)
      try {
        const result = await getActiveProjectsCountByUserId(user.id)
        setActiveProjectsCount(result.count)
        setActiveOrganizationsCount(result.organizations)
      } catch (error) {
        console.error('Erro ao carregar projetos ativos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [user])

  return (
    <StatCard
      change={
        loading
          ? '...'
          : `${activeOrganizationsCount} organizaç${activeOrganizationsCount === 1 ? 'ão' : 'ões'}`
      }
      changeType="neutral"
      icon={Target}
      label="Projetos Ativos"
      value={loading ? '...' : activeProjectsCount.toString()}
    />
  )
}
