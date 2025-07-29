import { supabase } from '@/lib/supabase-client'
import type {
  CreateOrganizationUser,
  OrganizationUser,
  OrganizationUserWithProfile,
  UpdateOrganizationUser,
} from './types'

export async function getOrganizationUserById(
  id: string
): Promise<OrganizationUser | null> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar organization user:', error)
    return null
  }

  return data
}

export async function getOrganizationUserByOrganizationAndUser(
  organizationId: string,
  userId: string
): Promise<OrganizationUser | null> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar organization user:', error)
    return null
  }

  return data
}

export async function getOrganizationUsersByOrganizationId(
  organizationId: string
): Promise<OrganizationUser[]> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar usuários da organização:', error)
    return []
  }

  return data || []
}

export async function getOrganizationUsersWithProfiles(
  organizationId: string
): Promise<OrganizationUserWithProfile[]> {
  const { data, error } = await supabase
    .from('organization_users')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar usuários da organização com perfis:', error)
    return []
  }

  return data || []
}

export async function getOrganizationUsersByUserId(
  userId: string
): Promise<OrganizationUser[]> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar organizações do usuário:', error)
    return []
  }

  return data || []
}

export async function getOrganizationUsersByOrganizationIdAndRole(
  organizationId: string,
  role: 'admin' | 'manager' | 'user'
): Promise<OrganizationUser[]> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar usuários por role:', error)
    return []
  }

  return data || []
}

export async function createOrganizationUser(
  organizationUser: CreateOrganizationUser
): Promise<OrganizationUser | null> {
  const { data, error } = await supabase
    .from('organization_users')
    .insert(organizationUser)
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar usuário à organização:', error)
    return null
  }

  return data
}

export async function updateOrganizationUser(
  organizationId: string,
  userId: string,
  updates: UpdateOrganizationUser
): Promise<OrganizationUser | null> {
  const { data, error } = await supabase
    .from('organization_users')
    .update(updates)
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar role do usuário:', error)
    return null
  }

  return data
}

export async function removeOrganizationUser(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('organization_users')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao remover usuário da organização:', error)
    return false
  }

  return true
}

export async function isUserAdminOfOrganization(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const user = await getOrganizationUserByOrganizationAndUser(
    organizationId,
    userId
  )
  return user?.role === 'admin'
}

export async function isUserManagerOfOrganization(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const user = await getOrganizationUserByOrganizationAndUser(
    organizationId,
    userId
  )
  return user?.role === 'manager' || user?.role === 'admin'
}

export async function hasUserAccessToOrganization(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const user = await getOrganizationUserByOrganizationAndUser(
    organizationId,
    userId
  )
  return !!user
}

export async function promoteUserToAdmin(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const result = await updateOrganizationUser(organizationId, userId, {
    role: 'admin',
  })
  return !!result
}

export async function promoteUserToManager(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const result = await updateOrganizationUser(organizationId, userId, {
    role: 'manager',
  })
  return !!result
}

export async function demoteUserToUser(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const result = await updateOrganizationUser(organizationId, userId, {
    role: 'user',
  })
  return !!result
}
