'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { getUserProjectsWithTimeEntries } from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { ProjectCard } from './ProjectCard'

interface ProjectsListProps {
  refreshKey?: number
  organizationId?: string
  onStartTimer?: (projectId: string) => void
  onAddTimeEntry?: (projectId: string) => void
  hasActiveTimer?: boolean
}

export function ProjectsList({
  refreshKey = 0,
  organizationId,
  onStartTimer,
  onAddTimeEntry,
  hasActiveTimer = false,
}: ProjectsListProps) {
  const { user } = useAuth()
  // No dashboard, não temos organizationId específico, então não verificamos permissões
  const { canViewAllTimeEntries } = usePermissions(organizationId || '')
  const [organizations, setOrganizations] = useState<
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const data = await getUserProjectsWithTimeEntries(user.id)
        setOrganizations(data)
      } catch (error) {
        console.error('Erro ao carregar projetos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const _ = refreshKey

    loadProjects()
  }, [user, refreshKey])

  // Filtrar apenas projetos ativos
  const activeOrganizations = organizations
    .map((org) => ({
      ...org,
      projects: org.projects.filter((project) => !project.is_finished),
    }))
    .filter((org) => org.projects.length > 0)

  return (
    <div className="lg:col-span-2">
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-white">Projetos Ativos</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner fullScreen={false} />
          </div>
        ) : activeOrganizations.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="font-medium text-gray-300 text-lg">
              Nenhum projeto com apontamentos encontrado
            </h3>
            <p className="mt-2 text-gray-500">
              Você ainda não fez apontamentos em nenhum projeto.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrganizations.map((org, orgIndex) => (
              <div key={orgIndex}>
                <h4 className="mb-3 font-medium text-gray-300 text-sm uppercase tracking-wide">
                  {org.organization.name}
                </h4>
                <div className="space-y-3">
                  {org.projects.map((project, projectIndex) => (
                    <ProjectCard
                      canManageTimeEntries={canViewAllTimeEntries}
                      hasActiveTimer={hasActiveTimer}
                      hours={project.total_hours}
                      key={projectIndex}
                      lastActivity={project.last_activity}
                      name={project.name}
                      onAddTimeEntry={onAddTimeEntry}
                      onStartTimer={onStartTimer}
                      organization={org.organization.name}
                      organizationId={org.organization.id}
                      projectId={project.id}
                      status={project.is_finished ? 'finished' : 'active'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
