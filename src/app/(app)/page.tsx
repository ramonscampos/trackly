'use client'

import { useEffect, useState } from 'react'
import { DashboardSidebar } from '@/components/home/DashboardSidebar'
import { ProjectsList } from '@/components/home/ProjectsList'
import { StatsGrid } from '@/components/home/StatsGrid'
import { AddTimeEntryModal } from '@/components/ui/add-time-entry-modal'
import { getActiveTimer } from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [hasActiveTimer, setHasActiveTimer] = useState(false)
  const [isAddTimeEntryModalOpen, setIsAddTimeEntryModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  )

  const handleRefreshProjects = () => {
    setRefreshKey((prev) => prev + 1)
    window.location.reload()
  }

  const handleTimerStateChange = () => {
    // Recarregar a página para atualizar o estado do timer
    window.location.reload()
  }

  // Verificar se há timer ativo
  useEffect(() => {
    const checkActiveTimer = async () => {
      if (!user) return

      try {
        const activeTimer = await getActiveTimer(user.id)
        setHasActiveTimer(!!activeTimer)
      } catch (error) {
        console.error('Erro ao verificar timer ativo:', error)
      }
    }

    checkActiveTimer()
  }, [user])

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
          <ProjectsList
            hasActiveTimer={hasActiveTimer}
            onAddTimeEntry={(projectId) => {
              setSelectedProjectId(projectId)
              setIsAddTimeEntryModalOpen(true)
            }}
            refreshKey={refreshKey}
          />
        </div>
        <DashboardSidebar
          onRefreshProjects={handleRefreshProjects}
          onTimerStateChange={handleTimerStateChange}
        />
      </div>

      {/* Modal de adicionar time entry */}
      <AddTimeEntryModal
        isOpen={isAddTimeEntryModalOpen}
        onClose={() => {
          setIsAddTimeEntryModalOpen(false)
          setSelectedProjectId(null)
        }}
        onTimeEntryAdded={() => {
          setIsAddTimeEntryModalOpen(false)
          setSelectedProjectId(null)
          handleRefreshProjects()
        }}
        projectId={selectedProjectId!}
        userId={user?.id || ''}
      />
    </>
  )
}
