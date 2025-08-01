'use client'

import { Clock, Plus } from 'lucide-react'
import { useState } from 'react'
import { TimerCard } from '@/components/dashboard/TimerCard'
import { AddTimeEntryModal } from '@/components/ui/add-time-entry-modal'
import { Button } from '@/components/ui/button'
import { SelectProjectModal } from '@/components/ui/select-project-modal'
import { useAuth } from '@/lib/hooks/useAuth'

interface DashboardSidebarProps {
  onRefreshProjects?: () => void
  onTimerStateChange?: () => void
}

export function DashboardSidebar({
  onRefreshProjects,
  onTimerStateChange,
}: DashboardSidebarProps) {
  const { user } = useAuth()
  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] =
    useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const handleTimerStopped = () => {
    if (onRefreshProjects) {
      onRefreshProjects()
    }
  }

  const handleAddTimeEntry = () => {
    setIsSelectProjectModalOpen(true)
  }

  const handleCloseSelectProjectModal = () => {
    setIsSelectProjectModalOpen(false)
  }

  const handleProjectSelected = (projectId: string) => {
    setSelectedProjectId(projectId)
    setIsSelectProjectModalOpen(false)
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setSelectedProjectId('')
  }

  const handleTimeEntryAdded = () => {
    if (onRefreshProjects) {
      onRefreshProjects()
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <TimerCard
        onTimerStarted={onTimerStateChange}
        onTimerStopped={handleTimerStopped}
        userId={user.id}
      />

      {/* Botão para adicionar time entry */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
        <h3 className="mb-3 font-medium text-white">Adicionar Apontamento</h3>
        <p className="mb-4 text-gray-400 text-sm">
          Adicione manualmente um apontamento de horas
        </p>
        <Button
          className="w-full cursor-pointer"
          onClick={handleAddTimeEntry}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Apontamento
        </Button>
      </div>

      {/* Modal de seleção de projeto */}
      <SelectProjectModal
        isOpen={isSelectProjectModalOpen}
        onClose={handleCloseSelectProjectModal}
        onProjectSelected={handleProjectSelected}
      />

      {/* Modal de adicionar time entry */}
      <AddTimeEntryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onTimeEntryAdded={handleTimeEntryAdded}
        projectId={selectedProjectId}
        userId={user.id}
      />
    </div>
  )
}
