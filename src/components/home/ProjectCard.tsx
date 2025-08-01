'use client'

import {
  Clock,
  Folder,
  List,
  MoreHorizontal,
  Play,
  Settings,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { startTimer } from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

interface ProjectCardProps {
  organization: string
  organizationId: string
  projectId: string
  name: string
  status: 'active' | 'finished'
  hours: string
  lastActivity: string
  canManageTimeEntries?: boolean
  onStartTimer?: (projectId: string) => void
  onAddTimeEntry?: (projectId: string) => void
  hasActiveTimer?: boolean
}

export function ProjectCard({
  organization,
  organizationId,
  projectId,
  name,
  status,
  hours,
  lastActivity,
  canManageTimeEntries = false,
  onStartTimer,
  onAddTimeEntry,
  hasActiveTimer = false,
}: ProjectCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleStartTimer = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmStartTimer = async () => {
    if (!user) return

    try {
      await startTimer(user.id, projectId)
      setShowConfirmModal(false)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao iniciar timer:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao iniciar timer'
      )
    }
  }

  const handleViewTimeEntries = () => {
    router.push(
      `/organizations/${organizationId}/projects/${projectId}/time-entries`
    )
  }

  const handleManageTimeEntries = () => {
    router.push(
      `/organizations/${organizationId}/projects/${projectId}/manage-time-entries`
    )
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-gray-600 bg-gray-700/30 p-4 transition-colors hover:bg-gray-700/50">
        <div className="flex items-center space-x-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-600/50">
            <Folder className="h-4 w-4 text-gray-300" />
          </div>
          <div>
            <h4 className="font-medium text-gray-200">{name}</h4>
            <p className="text-gray-400 text-sm">{organization}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300 text-sm">{hours}</span>
            </div>
            <p className="text-gray-500 text-xs">{lastActivity}</p>
          </div>
          <div className="flex items-center space-x-1">
            {/* Botão para iniciar timer - só aparece se não há timer ativo */}
            {!hasActiveTimer && (
              <Button
                className="h-8 w-8 cursor-pointer p-0"
                disabled={status === 'finished'}
                onClick={() => onStartTimer?.(projectId) || handleStartTimer()}
                size="sm"
                title="Iniciar timer"
                variant="ghost"
              >
                <Play className="h-4 w-4 text-green-400" />
              </Button>
            )}

            {/* Botão para adicionar time entry */}
            <Button
              className="h-8 w-8 cursor-pointer p-0"
              onClick={() => onAddTimeEntry?.(projectId)}
              size="sm"
              title="Adicionar apontamento"
              variant="ghost"
            >
              <Clock className="h-4 w-4 text-blue-400" />
            </Button>

            {/* Botão para ver apontamentos */}
            <Button
              className="h-8 w-8 cursor-pointer p-0"
              onClick={handleViewTimeEntries}
              size="sm"
              title="Ver meus apontamentos"
              variant="ghost"
            >
              <List className="h-4 w-4 text-gray-400" />
            </Button>

            {/* Dropdown para gestores */}
            {canManageTimeEntries && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-8 w-8 cursor-pointer p-0"
                    size="sm"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 border-gray-600 bg-gray-800"
                >
                  <DropdownMenuItem
                    className="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={handleManageTimeEntries}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar apontamentos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmação para iniciar timer */}
      <ConfirmModal
        cancelText="Cancelar"
        confirmText="Iniciar"
        isOpen={showConfirmModal}
        message={`Deseja iniciar um timer para o projeto "${name}"?`}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmStartTimer}
        title="Iniciar Timer"
        variant="info"
      />
    </>
  )
}
