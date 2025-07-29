import { useEffect, useMemo, useState } from 'react'
import { getOrganizationUserRole } from '@/lib/database/organizations'
import { useAuth } from './useAuth'

export type UserRole = 'admin' | 'manager' | 'user'

interface UsePermissionsReturn {
  userRole: UserRole | null
  isLoading: boolean
  isAdmin: boolean
  isManager: boolean
  isUser: boolean
  canEditOrganization: boolean
  canManageUsers: boolean
  canManageProjects: boolean
  canDeleteProjects: boolean
  canFinishProjects: boolean
  canViewAllTimeEntries: boolean
}

export function usePermissions(organizationId: string): UsePermissionsReturn {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserRole = async () => {
      if (!(user && organizationId)) {
        setIsLoading(false)
        return
      }

      try {
        const role = await getOrganizationUserRole(organizationId, user.id)
        setUserRole(role)
      } catch (error) {
        console.error('Erro ao carregar role do usuário:', error)
        setUserRole(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserRole()
  }, [user, organizationId])

  const {
    isAdmin,
    isManager,
    isUser,
    canEditOrganization,
    canManageUsers,
    canManageProjects,
    canDeleteProjects,
    canFinishProjects,
    canViewAllTimeEntries,
  } = useMemo(() => {
    const admin = userRole === 'admin'
    const manager = userRole === 'manager'
    const regular = userRole === 'user'

    return {
      isAdmin: admin,
      isManager: manager,
      isUser: regular,
      canEditOrganization: admin,
      canManageUsers: admin,
      canManageProjects: admin,
      canDeleteProjects: admin,
      canFinishProjects: admin,
      canViewAllTimeEntries: admin || manager,
    }
  }, [userRole])

  return {
    userRole,
    isLoading,
    isAdmin,
    isManager,
    isUser,
    canEditOrganization,
    canManageUsers,
    canManageProjects,
    canDeleteProjects,
    canFinishProjects,
    canViewAllTimeEntries,
  }
}
