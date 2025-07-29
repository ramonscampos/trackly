'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import {
  deleteProject,
  finishProject,
  getProjectsByOrganizationId,
  reactivateProject,
} from '@/lib/database/projects'
import type { Project } from '@/lib/database/types'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { EmptyProjectsState } from './EmptyProjectsState'
import { ProjectCard } from './ProjectCard'

interface ProjectsTabProps {
  organizationId: string
}

export function ProjectsTab({ organizationId }: ProjectsTabProps) {
  const router = useRouter()
  const {
    canManageProjects,
    canDeleteProjects,
    canFinishProjects,
    canViewAllTimeEntries,
  } = usePermissions(organizationId)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [projectToFinish, setProjectToFinish] = useState<Project | null>(null)
  const [projectToReopen, setProjectToReopen] = useState<Project | null>(null)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const projectsData = await getProjectsByOrganizationId(organizationId)
      setProjects(projectsData)
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleCreateProject = () => {
    router.push(`/organizations/${organizationId}/projects/novo`)
  }

  const handleEditProject = (projectId: string) => {
    router.push(`/organizations/${organizationId}/projects/${projectId}/editar`)
  }

  const handleViewTimeEntries = (projectId: string) => {
    router.push(
      `/organizations/${organizationId}/projects/${projectId}/time-entries`
    )
  }

  const handleManageTimeEntries = (projectId: string) => {
    router.push(
      `/organizations/${organizationId}/projects/${projectId}/manage-time-entries`
    )
  }

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project)
    setShowDeleteModal(true)
  }

  const handleFinishProject = (project: Project) => {
    setProjectToFinish(project)
    setShowFinishModal(true)
  }

  const handleReopenProject = (project: Project) => {
    setProjectToReopen(project)
    setShowReopenModal(true)
  }

  const confirmFinish = async () => {
    if (!projectToFinish) return

    try {
      const success = await finishProject(projectToFinish.id)
      if (success) {
        await loadProjects()
        setShowFinishModal(false)
        setProjectToFinish(null)
      } else {
        toast.error('Erro ao finalizar projeto')
      }
    } catch (error) {
      console.error('Erro ao finalizar projeto:', error)
      toast.error('Erro ao finalizar projeto')
    }
  }

  const confirmReopen = async () => {
    if (!projectToReopen) return

    try {
      const success = await reactivateProject(projectToReopen.id)
      if (success) {
        await loadProjects()
        setShowReopenModal(false)
        setProjectToReopen(null)
      } else {
        toast.error('Erro ao reabrir projeto')
      }
    } catch (error) {
      console.error('Erro ao reabrir projeto:', error)
      toast.error('Erro ao reabrir projeto')
    }
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return

    try {
      const success = await deleteProject(projectToDelete.id)
      if (success) {
        await loadProjects()
        setShowDeleteModal(false)
        setProjectToDelete(null)
      } else {
        toast.error('Erro ao deletar projeto')
      }
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
      toast.error('Erro ao deletar projeto')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner fullScreen={false} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white text-xl">Projetos</h2>
          <p className="text-gray-400 text-sm">
            Gerencie os projetos desta organização
            <span className="ml-2 text-gray-500">
              • {projects.length} projeto{projects.length !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
        {canManageProjects && (
          <Button className="cursor-pointer" onClick={handleCreateProject}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyProjectsState
          canManageProjects={canManageProjects}
          onCreateProject={handleCreateProject}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              canDeleteProjects={canDeleteProjects}
              canFinishProjects={canFinishProjects}
              canManageProjects={canManageProjects}
              canViewAllTimeEntries={canViewAllTimeEntries}
              key={project.id}
              onDeleteProject={handleDeleteProject}
              onEditProject={handleEditProject}
              onFinishProject={handleFinishProject}
              onManageTimeEntries={handleManageTimeEntries}
              onReopenProject={handleReopenProject}
              onViewTimeEntries={handleViewTimeEntries}
              organizationId={organizationId}
              project={project}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        confirmText="Deletar"
        isOpen={showDeleteModal}
        message={`Tem certeza que deseja deletar o projeto "${projectToDelete?.name}"? Esta ação não pode ser desfeita.`}
        onClose={() => {
          setShowDeleteModal(false)
          setProjectToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Deletar Projeto"
        variant="danger"
      />

      <ConfirmModal
        confirmText="Finalizar"
        isOpen={showFinishModal}
        message={`Tem certeza que deseja finalizar o projeto "${projectToFinish?.name}"? Projetos finalizados não podem receber novos lançamentos de horas.`}
        onClose={() => {
          setShowFinishModal(false)
          setProjectToFinish(null)
        }}
        onConfirm={confirmFinish}
        title="Finalizar Projeto"
        variant="warning"
      />

      <ConfirmModal
        confirmText="Reabrir"
        isOpen={showReopenModal}
        message={`Tem certeza que deseja reabrir o projeto "${projectToReopen?.name}"? O projeto voltará a aceitar lançamentos de horas.`}
        onClose={() => {
          setShowReopenModal(false)
          setProjectToReopen(null)
        }}
        onConfirm={confirmReopen}
        title="Reabrir Projeto"
        variant="info"
      />
    </div>
  )
}
