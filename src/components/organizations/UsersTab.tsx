'use client'

import {
  Clock,
  Crown,
  Edit,
  Plus,
  Shield,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { InviteUserModal } from '@/components/ui/invite-user-modal'
import {
  getOrganizationUsersWithProfiles,
  removeOrganizationUser,
} from '@/lib/database/organization-users'
import type { OrganizationUserWithProfile } from '@/lib/database/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface UsersTabProps {
  organizationId: string
}

export function UsersTab({ organizationId }: UsersTabProps) {
  const { user: currentUser } = useAuth()
  const { canManageUsers } = usePermissions(organizationId)
  const [users, setUsers] = useState<OrganizationUserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] =
    useState<OrganizationUserWithProfile | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const usersData = await getOrganizationUsersWithProfiles(organizationId)
      setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleInviteUser = () => {
    setShowInviteModal(true)
  }

  const handleInviteSent = () => {
    // Recarregar a lista de usuários após o convite
    loadUsers()
  }

  const handleEditUser = (_userId: string) => {
    // TODO: Implementar edição de usuário
    alert('Funcionalidade de edição será implementada em breve')
  }

  const handleRemoveUser = (user: OrganizationUserWithProfile) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      const success = await removeOrganizationUser(
        organizationId,
        userToDelete.user_id
      )
      if (success) {
        await loadUsers()
        setShowDeleteModal(false)
        setUserToDelete(null)
      } else {
        alert('Erro ao remover usuário')
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error)
      alert('Erro ao remover usuário')
    }
  }

  const getRoleIcon = (role: 'admin' | 'manager' | 'user') => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-400" />
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-400" />
      case 'user':
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getRoleText = (role: 'admin' | 'manager' | 'user') => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'manager':
        return 'Gestor'
      case 'user':
        return 'Usuário'
    }
  }

  const getRoleColor = (role: 'admin' | 'manager' | 'user') => {
    switch (role) {
      case 'admin':
        return 'text-yellow-400'
      case 'manager':
        return 'text-blue-400'
      case 'user':
        return 'text-gray-400'
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
          <h2 className="font-semibold text-white text-xl">Usuários</h2>
          <p className="text-gray-400 text-sm">
            Gerencie os membros desta organização
            <span className="ml-2 text-gray-500">
              • {users.length} usuário{users.length !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
        {canManageUsers && (
          <Button className="cursor-pointer" onClick={handleInviteUser}>
            <Plus className="mr-2 h-4 w-4" />
            Convidar Usuário
          </Button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-medium text-gray-300 text-lg">
            Nenhum usuário encontrado
          </h3>
          <p className="mt-2 text-gray-500">
            Convide usuários para participar desta organização.
          </p>
          {canManageUsers && (
            <Button className="mt-4 cursor-pointer" onClick={handleInviteUser}>
              <Plus className="mr-2 h-4 w-4" />
              Convidar Usuário
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-colors hover:bg-gray-800/70"
              key={user.id}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <h3 className="font-semibold text-lg text-white">
                      {user.profile?.full_name ||
                        user.profile?.email ||
                        `Usuário #${user.user_id.slice(0, 8)}`}
                    </h3>
                  </div>

                  <div className="mb-4 flex items-center space-x-2 text-sm">
                    {getRoleIcon(user.role)}
                    <span className={getRoleColor(user.role)}>
                      {getRoleText(user.role)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-500 text-xs">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        Membro desde{' '}
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {currentUser &&
                  user.user_id !== currentUser.id &&
                  canManageUsers && (
                    <div className="flex space-x-2">
                      <Button
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditUser(user.id)}
                        size="sm"
                        title="Editar usuário"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        onClick={() => handleRemoveUser(user)}
                        size="sm"
                        title="Remover usuário"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        confirmText="Remover"
        isOpen={showDeleteModal}
        message={
          'Tem certeza que deseja remover este usuário da organização? Esta ação não pode ser desfeita.'
        }
        onClose={() => {
          setShowDeleteModal(false)
          setUserToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Remover Usuário"
        variant="danger"
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={handleInviteSent}
        organizationId={organizationId}
      />
    </div>
  )
}
