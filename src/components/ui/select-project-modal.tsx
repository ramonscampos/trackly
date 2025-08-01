'use client'

import { FolderOpen, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getUserProjectsWithTimeEntriesThisWeek } from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

interface SelectProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectSelected: (projectId: string) => void
}

export function SelectProjectModal({
  isOpen,
  onClose,
  onProjectSelected,
}: SelectProjectModalProps) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<
    Array<{
      organization: { id: string; name: string }
      projects: Array<{
        id: string
        name: string
        is_finished: boolean
        total_hours: string
        last_activity: string
        last_activity_date: string
      }>
    }>
  >([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadProjects = async () => {
      if (!(user && isOpen)) return

      setIsLoading(true)
      try {
        const data = await getUserProjectsWithTimeEntriesThisWeek(user.id)
        setProjects(data)
      } catch (error) {
        console.error('Erro ao carregar projetos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [user, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-white">
            Selecionar Projeto
          </h2>
          <Button
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-gray-400">Carregando projetos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-400">Nenhum projeto ativo encontrado</p>
              </div>
            ) : (
              projects.map((org) => (
                <div className="space-y-3" key={org.organization.id}>
                  <div className="rounded-lg border border-gray-600 bg-gray-700/30 p-3">
                    <h3 className="mb-2 flex items-center font-medium text-gray-200 text-sm">
                      <FolderOpen className="mr-2 h-4 w-4 text-gray-400" />
                      {org.organization.name}
                    </h3>
                    <div className="space-y-1">
                      {org.projects
                        .filter((project) => !project.is_finished)
                        .map((project) => (
                          <Button
                            className="w-full cursor-pointer justify-start rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-gray-200 text-sm transition-colors hover:border-gray-500 hover:bg-gray-600/50 hover:text-white"
                            key={project.id}
                            onClick={() => onProjectSelected(project.id)}
                            variant="ghost"
                          >
                            <span className="text-left">{project.name}</span>
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            className="cursor-pointer"
            onClick={onClose}
            variant="outline"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
