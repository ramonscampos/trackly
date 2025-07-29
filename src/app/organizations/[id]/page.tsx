'use client'

import { ArrowLeft, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { OrganizationTabs } from '@/components/organizations/OrganizationTabs'
import { Button } from '@/components/ui/button'
import { PermissionBadge } from '@/components/ui/permission-badge'
import { getOrganizationById } from '@/lib/database/organizations'
import type { Organization } from '@/lib/database/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function OrganizationDetailsPage({ params }: PageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = use(params)
  const { canEditOrganization, userRole } = usePermissions(id)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'users'>('projects')

  useEffect(() => {
    const loadOrganization = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const org = await getOrganizationById(id)
        if (org) {
          setOrganization(org)
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
  }, [user, id, router])

  const handleBack = () => {
    router.push('/organizations')
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

  if (!organization) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" onClick={handleBack} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="font-bold text-3xl text-white">
                {organization.name}
              </h1>
              {userRole && <PermissionBadge role={userRole} />}
            </div>
            <p className="mt-2 text-gray-400">
              Gerencie projetos e usuários desta organização
            </p>
          </div>
          {canEditOrganization && (
            <Button
              className="cursor-pointer"
              onClick={() =>
                router.push(`/organizations/${organization.id}/editar`)
              }
              size="sm"
              variant="outline"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

              <OrganizationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          organizationId={organization.id}
        />
    </>
  )
}
