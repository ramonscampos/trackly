import { supabase } from '@/lib/supabase-client'
import type {
  CreateOrganization,
  Organization,
  OrganizationWithProjects,
  OrganizationWithUsers,
  UpdateOrganization,
} from './types'

export async function getOrganizationById(
  id: string
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar organização:', error)
    return null
  }

  return data
}

export async function getOrganizationByIdWithUsers(
  id: string
): Promise<OrganizationWithUsers | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      users:organization_users(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar organização com usuários:', error)
    return null
  }

  return data
}

export async function getOrganizationByIdWithProjects(
  id: string
): Promise<OrganizationWithProjects | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      projects:projects(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar organização com projetos:', error)
    return null
  }

  return data
}

export async function getOrganizationsByUserId(
  userId: string
): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('organization_id')
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao buscar organizações do usuário:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  const organizationIds = data.map(item => item.organization_id)
  
  const { data: organizations, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .in('id', organizationIds)

  if (orgError) {
    console.error('Erro ao buscar detalhes das organizações:', orgError)
    return []
  }

  return organizations || []
}

export async function createOrganization(
  organization: CreateOrganization
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .insert(organization)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar organização:', error)
    return null
  }

  // Adicionar o criador como admin da organização
  if (data) {
    const { error: userError } = await supabase
      .from('organization_users')
      .insert({
        organization_id: data.id,
        user_id: organization.created_by,
        role: 'admin'
      })

    if (userError) {
      console.error('Erro ao adicionar criador como admin:', userError)
      // Não falhar a criação da organização por causa disso
    }
  }

  return data
}

export async function updateOrganization(
  id: string,
  updates: UpdateOrganization
): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar organização:', error)
    return null
  }

  return data
}

export async function deleteOrganization(id: string): Promise<boolean> {
  const { error } = await supabase.from('organizations').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar organização:', error)
    return false
  }

  return true
}

export async function hasUserAccessToOrganization(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Erro ao verificar acesso do usuário:', error)
    return false
  }

  return !!data
}

export async function isUserAdminOfOrganization(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Erro ao verificar role do usuário:', error)
    return false
  }

  return data?.role === 'admin'
}

export async function getOrganizationUserRole(
  organizationId: string,
  userId: string
): Promise<'admin' | 'manager' | 'user' | null> {
  const { data, error } = await supabase
    .from('organization_users')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar role do usuário na organização:', error)
    return null
  }

  return data?.role || null
}

export async function getOrganizationUserCount(
  organizationId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('organization_users')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Erro ao contar usuários da organização:', error)
    return 0
  }

  return count || 0
}
