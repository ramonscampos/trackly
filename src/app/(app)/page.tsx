'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/home/DashboardSidebar'
import { ProjectsList } from '@/components/home/ProjectsList'
import { StatsGrid } from '@/components/home/StatsGrid'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefreshProjects = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!user) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="mb-2 font-bold text-3xl text-white">
          Bem-vindo de volta, {user.user_metadata.name?.split(' ')?.[0]}
        </h2>
        <p className="text-gray-400">
          Aqui está um resumo das suas atividades de hoje
        </p>
      </div>

      <div className="mb-8">
        <StatsGrid />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectsList refreshKey={refreshKey} />
        </div>
        <DashboardSidebar onRefreshProjects={handleRefreshProjects} />
      </div>
    </>
  )
}
