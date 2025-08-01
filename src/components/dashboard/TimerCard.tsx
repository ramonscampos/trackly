'use client'

import { Building, Clock, Folder, Play, Square } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StartTimerModal } from '@/components/ui/start-timer-modal'
import { getOrganizationById } from '@/lib/database/organizations'
import { getProjectById } from '@/lib/database/projects'
import { getActiveTimer, stopTimer } from '@/lib/database/time-entries'
import type { Organization, Project, TimeEntry } from '@/lib/database/types'

interface TimerCardProps {
  userId: string
  onTimerStopped?: () => void
  onTimerStarted?: () => void
}

export function TimerCard({
  userId,
  onTimerStopped,
  onTimerStarted,
}: TimerCardProps) {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showStartModal, setShowStartModal] = useState(false)

  const loadActiveTimer = useCallback(async () => {
    setIsLoading(true)
    try {
      const timer = await getActiveTimer(userId)
      setActiveTimer(timer)

      if (timer) {
        // Carregar detalhes do projeto e organização
        const project = await getProjectById(timer.project_id)
        if (project) {
          setCurrentProject(project)
          const organization = await getOrganizationById(
            project.organization_id
          )
          setCurrentOrganization(organization)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar timer ativo:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadActiveTimer()
  }, [loadActiveTimer])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (activeTimer) {
      // Atualizar tempo a cada segundo
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.started_at).getTime()
        const now = new Date().getTime()
        setElapsedTime(now - startTime)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [activeTimer])

  const handleStartTimer = () => {
    setShowStartModal(true)
  }

  const handleStopTimer = async () => {
    if (!activeTimer) return

    try {
      const stoppedTimer = await stopTimer(userId)
      if (stoppedTimer) {
        setActiveTimer(null)
        setCurrentProject(null)
        setCurrentOrganization(null)
        setElapsedTime(0)

        // Mostrar toast de sucesso
        toast.success('Timer parado com sucesso!', {
          description: `Tempo registrado: ${formatTime(elapsedTime)}`,
          duration: 4000,
        })

        // Atualizar projetos se callback fornecido
        if (onTimerStopped) {
          onTimerStopped()
        }
      }
    } catch (error) {
      console.error('Erro ao parar timer:', error)
      toast.error('Erro ao parar timer', {
        description: error instanceof Error ? error.message : 'Tente novamente',
        duration: 5000,
      })
    }
  }

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Clock className="h-5 w-5 text-gray-400" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-600" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
        {activeTimer ? (
          <div className="space-y-4">
            {/* Timer ativo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-green-400" />
                <span className="font-medium text-gray-300 text-sm">
                  Timer Ativo
                </span>
              </div>
              <Button
                className="cursor-pointer border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                onClick={handleStopTimer}
                size="sm"
                variant="outline"
              >
                <Square className="mr-2 h-4 w-4" />
                Parar
              </Button>
            </div>

            {/* Tempo decorrido */}
            <div className="text-center">
              <div className="font-bold font-mono text-3xl text-white">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-gray-400 text-sm">Tempo decorrido</p>
            </div>

            {/* Projeto e organização */}
            {currentProject && currentOrganization && (
              <div className="space-y-2 rounded-lg border border-gray-600 bg-gray-700/50 p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">
                    {currentOrganization.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Folder className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{currentProject.name}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 font-semibold text-lg text-white">
              Nenhum Timer Ativo
            </h3>
            <p className="mb-4 text-gray-400 text-sm">
              Clique no botão abaixo para iniciar um novo timer
            </p>
            <Button className="cursor-pointer" onClick={handleStartTimer}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar Timer
            </Button>
          </div>
        )}
      </div>

      <StartTimerModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onTimerStarted={() => {
          loadActiveTimer()
          if (onTimerStarted) {
            onTimerStarted()
          }
        }}
        userId={userId}
      />
    </>
  )
}
