export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Organization {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface OrganizationUser {
  id: string
  organization_id: string
  user_id: string
  role: 'admin' | 'manager' | 'user'
  created_at: string
}

export interface Project {
  id: string
  organization_id: string
  name: string
  is_finished: boolean
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string
  started_at: string
  ended_at: string
  created_at: string
}

// Tipos para inserção (sem id e created_at)
export interface CreateProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface CreateOrganization {
  name: string
  created_by: string
}

export interface CreateOrganizationUser {
  organization_id: string
  user_id: string
  role: 'admin' | 'manager' | 'user'
}

export interface CreateProject {
  organization_id: string
  name: string
  is_finished?: boolean
}

export interface CreateTimeEntry {
  user_id: string
  project_id: string
  started_at: string
  ended_at?: string
}

// Tipos para atualização (todos os campos opcionais)
export interface UpdateProfile {
  email?: string
  full_name?: string
  avatar_url?: string
}

export interface UpdateOrganization {
  name?: string
}

export interface UpdateOrganizationUser {
  role?: 'admin' | 'manager' | 'user'
}

export interface UpdateProject {
  name?: string
  is_finished?: boolean
}

export interface UpdateTimeEntry {
  started_at?: string
  ended_at?: string
}

// Tipos para queries com joins
export interface ProjectWithOrganization extends Project {
  organization: Organization
}

export interface TimeEntryWithDetails extends TimeEntry {
  user: Profile
  project: ProjectWithOrganization
}

export interface OrganizationWithUsers extends Organization {
  users: OrganizationUser[]
}

export interface OrganizationWithProjects extends Organization {
  projects: Project[]
}

export interface OrganizationUserWithProfile extends OrganizationUser {
  profile: Profile
}

// Tipos para queries do Supabase com joins
export interface OrganizationUserWithOrganization {
  id: string
  organization_id: string
  user_id: string
  role: 'admin' | 'manager' | 'user'
  created_at: string
  organization: Organization
}
