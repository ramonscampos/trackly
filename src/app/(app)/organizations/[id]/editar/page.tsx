'use client'

import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  getOrganizationById,
  updateOrganization,
} from '@/lib/database/organizations'
import type { Organization } from '@/lib/database/types'
import { useAuth } from '@/lib/hooks/useAuth'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditOrganizationPage({ params }: PageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { id } = use(params)

  useEffect(() => {
    const loadOrganization = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const org = await getOrganizationById(id)
        if (org) {
          setOrganization(org)
          setName(org.name)
        } else {
          alert('Organização não encontrada')
          router.push('/organizations')
        }
      } catch (error) {
        console.error('Erro ao carregar organização:', error)
        alert('Erro ao carregar organização')
        router.push('/organizations')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadOrganization()
    }
  }, [user, id, router.push])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!(name.trim() && organization)) return

    setIsSubmitting(true)
    try {
      const updatedOrg = await updateOrganization(organization.id, {
        name: name.trim(),
      })

      if (updatedOrg) {
        router.push('/organizations')
      } else {
        alert('Erro ao atualizar organização')
      }
    } catch (error) {
      console.error('Erro ao atualizar organização:', error)
      alert('Erro ao atualizar organização')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/organizations/${id}`)
  }

  if (isLoading) {
    return <div className="flex justify-center py-12">Carregando...</div>
  }

  if (!user) {
    return null
  }

  if (!organization) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" onClick={handleCancel} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="font-bold text-3xl text-white">Editar Organização</h1>
        <p className="mt-2 text-gray-400">
          Atualize as informações da organização
        </p>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block font-medium text-gray-300 text-sm"
              htmlFor="name"
            >
              Nome da Organização
            </label>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              disabled={isSubmitting}
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da organização"
              required
              type="text"
              value={name}
            />
          </div>

          <div className="text-gray-400 text-sm">
            <p>
              Criada em:{' '}
              {new Date(organization.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="flex space-x-4 pt-6">
            <Button
              disabled={
                !name.trim() || isSubmitting || name === organization.name
              }
              type="submit"
            >
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
