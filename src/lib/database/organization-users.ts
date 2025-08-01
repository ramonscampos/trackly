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
    .maybeSingle()

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
    // Se o erro for 409 (usuário já existe), não é um erro real
    if (error.code === '23505') {
      console.log('Usuário já existe na organização (409)')
      return {
        ...organizationUser,
        created_at: new Date().toISOString(),
      } as OrganizationUser
    }
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

export async function createOrganizationInvite(
  organizationId: string,
  email: string,
  role: 'admin' | 'manager' | 'user'
): Promise<boolean> {
  const { error } = await supabase.from('organization_invites').insert({
    organization_id: organizationId,
    email: email.toLowerCase().trim(),
    role,
  })

  if (error) {
    console.error('Erro ao criar convite:', error)
    return false
  }

  return true
}

export async function getPendingInvitesByEmail(email: string): Promise<
  Array<{
    id: string
    organization_id: string
    email: string
    role: 'admin' | 'manager' | 'user'
    created_at: string
  }>
> {
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('email', email.toLowerCase().trim())

  if (error) {
    console.error('Erro ao buscar convites pendentes:', error)
    return []
  }

  return data || []
}

export async function processInvite(
  inviteId: string,
  userId: string
): Promise<boolean> {
  // Primeiro, buscar o convite
  const { data: invite, error: inviteError } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('id', inviteId)
    .maybeSingle()

  if (inviteError) {
    // Se o erro for porque o convite não existe, não é um erro real
    if (inviteError.code === 'PGRST116') {
      console.log('Convite não encontrado (provavelmente já foi processado)')
      return true
    }
    console.error('Erro ao buscar convite:', inviteError)
    return false
  }

  if (!invite) {
    console.log('Convite não encontrado')
    return true
  }

  // Verificar se o usuário já existe na organização
  const existingUser = await getOrganizationUserByOrganizationAndUser(
    invite.organization_id,
    userId
  )

  if (existingUser) {
    // Se o usuário já existe, apenas deletar o convite
    const { error: deleteInviteError } = await supabase
      .from('organization_invites')
      .delete()
      .eq('id', inviteId)

    if (deleteInviteError) {
      console.error('Erro ao deletar convite:', deleteInviteError)
      return false
    }

    return true
  }

  // Adicionar usuário à organização usando a função existente
  const newUser = await createOrganizationUser({
    organization_id: invite.organization_id,
    user_id: userId,
    role: invite.role,
  })

  if (!newUser) {
    console.error('Erro ao adicionar usuário à organização')
    return false
  }

  // Deletar o convite
  const { error: deleteError } = await supabase
    .from('organization_invites')
    .delete()
    .eq('id', inviteId)

  if (deleteError) {
    console.error('Erro ao deletar convite:', deleteError)
    return false
  }

  return true
}

export async function processAllPendingInvites(
  email: string,
  userId: string
): Promise<number> {
  const pendingInvites = await getPendingInvitesByEmail(email)
  let processedCount = 0

  // Processar convites sequencialmente para evitar condições de corrida
  for (const invite of pendingInvites) {
    const success = await processInvite(invite.id, userId)
    if (success) {
      processedCount++
    }
  }

  return processedCount
}

export async function getPendingInvitesByOrganization(
  organizationId: string
): Promise<
  Array<{
    id: string
    organization_id: string
    email: string
    role: 'admin' | 'manager' | 'user'
    created_at: string
  }>
> {
  const { data, error } = await supabase
    .from('organization_invites')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar convites da organização:', error)
    return []
  }

  return data || []
}

export async function revokeInvite(inviteId: string): Promise<boolean> {
  const { error } = await supabase
    .from('organization_invites')
    .delete()
    .eq('id', inviteId)

  if (error) {
    console.error('Erro ao revogar convite:', error)
    return false
  }

  return true
}
