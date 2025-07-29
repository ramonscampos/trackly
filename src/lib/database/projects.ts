import { supabase } from '@/lib/supabase-client'
import type {
  CreateProject,
  Project,
  ProjectWithOrganization,
  UpdateProject,
} from './types'

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar projeto:', error)
    return null
  }

  return data
}

export async function getProjectByIdWithOrganization(
  id: string
): Promise<ProjectWithOrganization | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar projeto com organização:', error)
    return null
  }

  return data
}

export async function getProjectsByOrganizationId(
  organizationId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar projetos da organização:', error)
    return []
  }

  return data || []
}

export async function getActiveProjectsByOrganizationId(
  organizationId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_finished', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar projetos ativos da organização:', error)
    return []
  }

  return data || []
}

export async function getProjectsByUserId(
  userId: string
): Promise<ProjectWithOrganization[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(
        *,
        organization_users!inner(user_id)
      )
    `)
    .eq('organization.organization_users.user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar projetos do usuário:', error)
    return []
  }

  return data || []
}

export async function getActiveProjectsByUserId(
  userId: string
): Promise<ProjectWithOrganization[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(
        *,
        organization_users!inner(user_id)
      )
    `)
    .eq('organization.organization_users.user_id', userId)
    .eq('is_finished', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar projetos ativos do usuário:', error)
    return []
  }

  return data || []
}

export async function createProject(
  project: CreateProject
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar projeto:', error)
    return null
  }

  return data
}

export async function updateProject(
  id: string,
  updates: UpdateProject
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar projeto:', error)
    return null
  }

  return data
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar projeto:', error)
    return false
  }

  return true
}

export function finishProject(id: string): Promise<Project | null> {
  return updateProject(id, { is_finished: true })
}

export function reactivateProject(id: string): Promise<Project | null> {
  return updateProject(id, { is_finished: false })
}
