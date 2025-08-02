'use client'

import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { getProjectById, updateProject } from '@/lib/database/projects'
import type { Project } from '@/lib/database/types'
import { useAuth } from '@/lib/hooks/useAuth'

interface PageProps {
  params: Promise<{
    id: string
    projectId: string
  }>
}

export default function EditProjectPage({ params }: PageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { id: organizationId, projectId } = use(params)

  useEffect(() => {
    const loadProject = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const projectData = await getProjectById(projectId)
        if (projectData) {
          setProject(projectData)
          setName(projectData.name)
        } else {
          alert('Projeto não encontrado')
          router.push(`/organizations/${organizationId}`)
        }
      } catch (error) {
        console.error('Erro ao carregar projeto:', error)
        alert('Erro ao carregar projeto')
        router.push(`/organizations/${organizationId}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadProject()
    }
  }, [user, projectId, organizationId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!(name.trim() && project)) return

    setIsSubmitting(true)
    try {
      const updatedProject = await updateProject(project.id, {
        name: name.trim(),
      })

      if (updatedProject) {
        router.push(`/organizations/${organizationId}`)
      } else {
        alert('Erro ao atualizar projeto')
      }
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      alert('Erro ao atualizar projeto')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/organizations/${organizationId}`)
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner fullScreen={false} />
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" onClick={handleCancel} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="font-bold text-3xl text-white">Editar Projeto</h1>
        <p className="mt-2 text-gray-400">Atualize as informações do projeto</p>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block font-medium text-gray-300 text-sm"
              htmlFor="name"
            >
              Nome do Projeto
            </label>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              disabled={isSubmitting}
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do projeto"
              required
              type="text"
              value={name}
            />
          </div>

          <div className="flex space-x-4 pt-6">
            <Button disabled={!name.trim() || isSubmitting} type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleCancel}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
