'use client'

import { Folder, Plus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  getOrganizationByIdWithProjects,
  getOrganizationsByUserId,
  getOrganizationUserCount,
} from '@/lib/database/organizations'
import type { OrganizationWithProjects } from '@/lib/database/types'
import { useAuth } from '@/lib/hooks/useAuth'

export default function OrganizationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<
    (OrganizationWithProjects & { userCount: number })[]
  >([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  useEffect(() => {
    const loadOrganizations = async () => {
      if (!user) return

      setLoadingOrgs(true)
      try {
        const orgs = await getOrganizationsByUserId(user.id)

        // Buscar projetos e contagem de usuários para cada organização
        const orgsWithProjects = await Promise.all(
          orgs.map(async (org) => {
            const [orgWithProjects, userCount] = await Promise.all([
              getOrganizationByIdWithProjects(org.id),
              getOrganizationUserCount(org.id),
            ])

            return {
              ...(orgWithProjects || { ...org, projects: [] }),
              userCount,
            }
          })
        )

        setOrganizations(orgsWithProjects)
      } catch (error) {
        console.error('Erro ao carregar organizações:', error)
      } finally {
        setLoadingOrgs(false)
      }
    }

    if (user) {
      loadOrganizations()
    }
  }, [user])

  const handleCreateOrganization = () => {
    router.push('/organizations/nova')
  }

  if (!user) {
    return null
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-white">Organizações</h1>
          <p className="mt-2 text-gray-400">
            Gerencie suas organizações e projetos
          </p>
        </div>
        <Button onClick={handleCreateOrganization}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Organização
        </Button>
      </div>

      {loadingOrgs ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner fullScreen={false} />
        </div>
      ) : organizations.length === 0 ? (
        <div className="py-12 text-center">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-medium text-gray-300 text-lg">
            Nenhuma organização encontrada
          </h3>
          <p className="mt-2 text-gray-500">
            Crie sua primeira organização para começar a gerenciar projetos.
          </p>
          <Button className="mt-4" onClick={handleCreateOrganization}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Organização
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((organization) => (
            <Button
              className="h-auto cursor-pointer rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-colors hover:bg-gray-800/70"
              key={organization.id}
              onClick={() => router.push(`/organizations/${organization.id}`)}
              variant="ghost"
            >
              <div className="flex w-full items-start justify-between">
                <div className="flex-1 text-left">
                  <h3 className="mb-2 font-semibold text-lg text-white">
                    {organization.name}
                  </h3>
                  <div className="mb-4 flex items-center space-x-4 text-gray-400 text-sm">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      <span>
                        {organization.userCount} membro
                        {organization.userCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Folder className="mr-1 h-4 w-4" />
                      <span>
                        {organization.projects?.length || 0} projeto
                        {organization.projects?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Criada em{' '}
                    {new Date(organization.created_at).toLocaleDateString(
                      'pt-BR'
                    )}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </>
  )
}
