'use client'

import {
  CheckCircle,
  CheckSquare,
  Edit,
  List,
  MoreHorizontal,
  Settings,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Project } from '@/lib/database/types'

interface ProjectActionsProps {
  project: Project
  organizationId: string
  hasAnyPermission: boolean
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

export function ProjectActions({
  project,
  hasAnyPermission,
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
}: ProjectActionsProps) {
  if (!hasAnyPermission) {
    // Usuário comum - botão direto para ver apontamentos
    return (
      <Button
        className="h-8 w-8 p-0"
        onClick={() => onViewTimeEntries(project.id)}
        size="sm"
        title="Ver meus apontamentos"
        variant="ghost"
      >
        <List className="h-4 w-4" />
      </Button>
    )
  }

  // Usuário tem permissões de gestão - usa dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border-gray-600 bg-gray-800"
      >
        <DropdownMenuItem
          className="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={() => onViewTimeEntries(project.id)}
        >
          <List className="mr-2 h-4 w-4" />
          Ver meus apontamentos
        </DropdownMenuItem>
        {canViewAllTimeEntries && (
          <DropdownMenuItem
            className="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => onManageTimeEntries(project.id)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Gerenciar apontamentos
          </DropdownMenuItem>
        )}
        {canManageProjects && (
          <DropdownMenuItem
            className="cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => onEditProject(project.id)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar projeto
          </DropdownMenuItem>
        )}
        {canFinishProjects && (
          <DropdownMenuItem
            className={`cursor-pointer hover:bg-gray-700 hover:text-white ${
              project.is_finished
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-green-400 hover:text-green-300'
            }`}
            onClick={() =>
              project.is_finished
                ? onReopenProject(project)
                : onFinishProject(project)
            }
          >
            {project.is_finished ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Reabrir projeto
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Finalizar projeto
              </>
            )}
          </DropdownMenuItem>
        )}
        {canDeleteProjects && (
          <DropdownMenuItem
            className="cursor-pointer text-red-400 hover:bg-gray-700 hover:text-red-300"
            onClick={() => onDeleteProject(project)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar projeto
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
