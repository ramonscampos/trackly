'use client'

import { Clock, Folder } from 'lucide-react'
import type { Project } from '@/lib/database/types'
import { ProjectActions } from './ProjectActions'
import { ProjectStatus } from './ProjectStatus'

interface ProjectCardProps {
  project: Project
  organizationId: string
  canViewAllTimeEntries: boolean
  canManageProjects: boolean
  canFinishProjects: boolean
  canDeleteProjects: boolean
  onViewTimeEntries: (projectId: string) => void
  onManageTimeEntries: (projectId: string) => void
  onEditProject: (projectId: string) => void
  onFinishProject: (project: Project) => void
  onReopenProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
}

export function ProjectCard({
  project,
  organizationId,
  canViewAllTimeEntries,
  canManageProjects,
  canFinishProjects,
  canDeleteProjects,
  onViewTimeEntries,
  onManageTimeEntries,
  onEditProject,
  onFinishProject,
  onReopenProject,
  onDeleteProject,
}: ProjectCardProps) {
  const hasAnyPermission =
    canViewAllTimeEntries ||
    canManageProjects ||
    canFinishProjects ||
    canDeleteProjects

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-colors hover:bg-gray-800/70">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center space-x-2">
            <Folder className="h-4 w-4 text-gray-400" />
            <h3 className="font-semibold text-lg text-white">{project.name}</h3>
          </div>

          <ProjectStatus isFinished={project.is_finished} />

          <div className="flex items-center space-x-4 text-gray-500 text-xs">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>
                Criado em{' '}
                {new Date(project.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        <ProjectActions
          canDeleteProjects={canDeleteProjects}
          canFinishProjects={canFinishProjects}
          canManageProjects={canManageProjects}
          canViewAllTimeEntries={canViewAllTimeEntries}
          hasAnyPermission={hasAnyPermission}
          onDeleteProject={onDeleteProject}
          onEditProject={onEditProject}
          onFinishProject={onFinishProject}
          onManageTimeEntries={onManageTimeEntries}
          onReopenProject={onReopenProject}
          onViewTimeEntries={onViewTimeEntries}
          organizationId={organizationId}
          project={project}
        />
      </div>
    </div>
  )
}
