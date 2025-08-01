import { supabase } from '@/lib/supabase-client'
import { calculateTimeInMinutes, formatMinutesToHours } from '@/lib/utils'
import type {
  CreateTimeEntry,
  TimeEntry,
  TimeEntryWithDetails,
  UpdateTimeEntry,
} from './types'

export async function getTimeEntryById(id: string): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar time entry:', error)
    return null
  }

  return data
}

export async function getTimeEntryByIdWithDetails(
  id: string
): Promise<TimeEntryWithDetails | null> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      user:profiles(*),
      project:projects(
        *,
        organization:organizations(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar time entry com detalhes:', error)
    return null
  }

  return data
}

export async function getTimeEntriesByUserId(
  userId: string
): Promise<TimeEntryWithDetails[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      user:profiles(*),
      project:projects(
        *,
        organization:organizations(*)
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar time entries do usuário:', error)
    return []
  }

  return data || []
}

export async function getTimeEntriesByProjectId(
  projectId: string
): Promise<TimeEntryWithDetails[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      user:profiles(*),
      project:projects(
        *,
        organization:organizations(*)
      )
    `)
    .eq('project_id', projectId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar time entries do projeto:', error)
    return []
  }

  return data || []
}

// Buscar apenas os apontamentos do usuário logado em um projeto específico
export async function getUserTimeEntriesByProjectId(
  projectId: string,
  userId: string
): Promise<TimeEntryWithDetails[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      user:profiles(*),
      project:projects(
        *,
        organization:organizations(*)
      )
    `)
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar time entries do usuário no projeto:', error)
    return []
  }

  return data || []
}

export async function getTimeEntriesByOrganizationId(
  organizationId: string
): Promise<TimeEntryWithDetails[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      user:profiles(*),
      project:projects(
        *,
        organization:organizations!inner(*)
      )
    `)
    .eq('project.organization.id', organizationId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar time entries da organização:', error)
    return []
  }

  return data || []
}

export async function getTimeEntriesByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntryWithDetails[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      user:profiles(*),
      project:projects(
        *,
        organization:organizations(*)
      )
    `)
    .eq('user_id', userId)
    .gte('started_at', startDate)
    .lte('started_at', endDate)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar time entries por período:', error)
    return []
  }

  return data || []
}

export async function getTodayTimeEntriesByUserId(
  userId: string
): Promise<TimeEntryWithDetails[]> {
  const today = new Date()
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString()
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  ).toISOString()

  return await getTimeEntriesByDateRange(userId, startOfDay, endOfDay)
}

export async function getTodayHoursByUserId(userId: string): Promise<number> {
  const today = new Date()
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString()
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  ).toISOString()

  return await getTotalHoursByDateRange(userId, startOfDay, endOfDay)
}

export async function getYesterdayHoursByUserId(
  userId: string
): Promise<number> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const startOfDay = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  ).toISOString()
  const endOfDay = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate() + 1
  ).toISOString()

  return await getTotalHoursByDateRange(userId, startOfDay, endOfDay)
}

export async function getThisWeekHoursByUserId(
  userId: string
): Promise<number> {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = domingo, 1 = segunda, etc.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Ajusta para segunda = 0

  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  monday.setHours(0, 0, 0, 0)

  const startOfWeek = monday.toISOString()
  const endOfWeek = new Date(
    monday.getTime() + 7 * 24 * 60 * 60 * 1000
  ).toISOString()

  return await getTotalHoursByDateRange(userId, startOfWeek, endOfWeek)
}

export async function getLastWeekHoursByUserId(
  userId: string
): Promise<number> {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  monday.setHours(0, 0, 0, 0)

  const lastMonday = new Date(monday.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfLastWeek = lastMonday.toISOString()
  const endOfLastWeek = monday.toISOString()

  return await getTotalHoursByDateRange(userId, startOfLastWeek, endOfLastWeek)
}

export async function getCurrentMonthHoursByUserId(
  userId: string
): Promise<number> {
  const today = new Date()
  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).toISOString()
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  ).toISOString()

  return await getTotalHoursByDateRange(userId, startOfMonth, endOfMonth)
}

export async function getActiveProjectsCountByUserId(
  userId: string
): Promise<{ count: number; organizations: number }> {
  // Usar a mesma lógica do getUserProjectsWithTimeEntries que já funciona
  const projectsData = await getUserProjectsWithTimeEntries(userId)

  // Contar projetos ativos (não finalizados)
  const activeProjects = projectsData.flatMap((org) =>
    org.projects.filter((project) => !project.is_finished)
  )

  // Contar organizações únicas que têm projetos ativos
  const activeOrganizations = projectsData.filter((org) =>
    org.projects.some((project) => !project.is_finished)
  )

  return {
    count: activeProjects.length,
    organizations: activeOrganizations.length,
  }
}

export async function getUserProjectsWithTimeEntriesThisWeek(
  userId: string
): Promise<
  Array<{
    organization: {
      id: string
      name: string
    }
    projects: Array<{
      id: string
      name: string
      is_finished: boolean
      total_hours: string
      last_activity: string
      last_activity_date: string
    }>
  }>
> {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = domingo, 1 = segunda, etc.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Ajusta para segunda = 0

  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  monday.setHours(0, 0, 0, 0)

  const startOfWeek = monday.toISOString()
  const endOfWeek = new Date(
    monday.getTime() + 7 * 24 * 60 * 60 * 1000
  ).toISOString()

  return await getUserProjectsWithTimeEntries(userId, startOfWeek, endOfWeek)
}

export async function getTotalHoursByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('started_at, ended_at')
    .eq('user_id', userId)
    .gte('started_at', startDate)
    .lte('started_at', endDate)

  if (error) {
    console.error('Erro ao calcular total de horas:', error)
    return 0
  }

  const totalMinutes =
    data?.reduce((total, entry) => {
      return total + calculateTimeInMinutes(entry.started_at, entry.ended_at)
    }, 0) ?? 0

  return totalMinutes / 60 // Converter minutos para horas
}

export async function createTimeEntry(
  timeEntry: CreateTimeEntry
): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('time_entries')
    .insert(timeEntry)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar time entry:', error)
    return null
  }

  return data
}

export async function updateTimeEntry(
  id: string,
  updates: UpdateTimeEntry
): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar time entry:', error)
    return null
  }

  return data
}

export async function deleteTimeEntry(id: string): Promise<boolean> {
  const { error } = await supabase.from('time_entries').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar time entry:', error)
    return false
  }

  return true
}

export async function hasUserAccessToTimeEntry(
  timeEntryId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('user_id')
    .eq('id', timeEntryId)
    .single()

  if (error) {
    console.error('Erro ao verificar acesso ao time entry:', error)
    return false
  }

  return data?.user_id === userId
}

// Funções para o timer
export async function startTimer(
  userId: string,
  projectId: string
): Promise<TimeEntry | null> {
  // Verificar se já existe um timer ativo para este usuário
  const activeTimer = await getActiveTimer(userId)
  if (activeTimer) {
    throw new Error(
      'Você já tem um timer ativo. Pare o timer atual antes de iniciar um novo.'
    )
  }

  const timeEntry = await createTimeEntry({
    user_id: userId,
    project_id: projectId,
    started_at: new Date().toISOString(),
  })

  return timeEntry
}

export async function stopTimer(userId: string): Promise<TimeEntry | null> {
  const activeTimer = await getActiveTimer(userId)
  if (!activeTimer) {
    throw new Error('Nenhum timer ativo encontrado.')
  }

  const updatedTimer = await updateTimeEntry(activeTimer.id, {
    ended_at: new Date().toISOString(),
  })

  return updatedTimer
}

export async function getActiveTimer(
  userId: string
): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar timer ativo:', error)
    return null
  }

  return data
}

// Tipos auxiliares para a função complexa
type ProjectEntry = {
  id: string
  name: string
  is_finished: boolean
  entries: Array<{ started_at: string; ended_at: string | null }>
}

type OrganizationData = {
  organization: { id: string; name: string }
  projects: Map<string, ProjectEntry>
}

// Função auxiliar para calcular total de minutos
function calculateTotalMinutes(
  entries: Array<{ started_at: string; ended_at: string | null }>
): number {
  return entries.reduce((acc, entry) => {
    if (entry.ended_at) {
      return acc + calculateTimeInMinutes(entry.started_at, entry.ended_at)
    }
    return acc
  }, 0)
}

// Função auxiliar para encontrar última atividade
function findLastActivity(
  entries: Array<{ started_at: string; ended_at: string | null }>
): string {
  return entries.reduce((last, entry) => {
    const entryDate = new Date(entry.started_at)
    if (!last || entryDate > new Date(last)) {
      return entry.started_at
    }
    return last
  }, '')
}

// Função auxiliar para formatar tempo relativo
function formatRelativeTime(lastActivity: string): string {
  const lastActivityDate = new Date(lastActivity)
  const now = new Date()
  const diffMs = now.getTime() - lastActivityDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) {
    return 'Agora mesmo'
  }
  if (diffHours < 24) {
    return `${diffHours} hora${diffHours !== 1 ? 's' : ''} atrás`
  }
  if (diffDays < 7) {
    return `${diffDays} dia${diffDays !== 1 ? 's' : ''} atrás`
  }
  return `${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''} atrás`
}

// Função auxiliar para formatar horas
function formatHours(totalMinutes: number): string {
  return formatMinutesToHours(totalMinutes)
}

// Função auxiliar para processar projeto
function processProject(project: ProjectEntry) {
  const totalMinutes = calculateTotalMinutes(project.entries)
  const lastActivity = findLastActivity(project.entries)
  const formattedLastActivity = formatRelativeTime(lastActivity)

  return {
    id: project.id,
    name: project.name,
    is_finished: project.is_finished,
    total_hours: formatHours(totalMinutes),
    last_activity: formattedLastActivity,
    last_activity_date: lastActivity,
  }
}

export async function getUserProjectsWithTimeEntries(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<
  Array<{
    organization: {
      id: string
      name: string
    }
    projects: Array<{
      id: string
      name: string
      is_finished: boolean
      total_hours: string
      last_activity: string
      last_activity_date: string
    }>
  }>
> {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      project:projects(
        id,
        name,
        is_finished,
        organization:organizations(
          id,
          name
        )
      )
    `)
    .eq('user_id', userId)
    .not('project_id', 'is', null)

  // Aplicar filtros de data se fornecidos
  if (startDate) {
    query = query.gte('started_at', startDate)
  }
  if (endDate) {
    query = query.lte('started_at', endDate)
  }

  const { data, error } = await query.order('started_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar projetos com apontamentos:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  const organizationMap = new Map<string, OrganizationData>()

  // Processar dados e organizar por organização
  data.forEach((entry) => {
    // Verificar se project existe
    if (!entry.project) return

    const project = entry.project

    // Verificar se organization existe
    if (!project.organization) return

    const organization = project.organization
    const orgId = organization.id
    const projectId = project.id

    if (!organizationMap.has(orgId)) {
      organizationMap.set(orgId, {
        organization: {
          id: orgId,
          name: organization.name,
        },
        projects: new Map(),
      })
    }

    const org = organizationMap.get(orgId)
    if (!org) return

    if (!org.projects.has(projectId)) {
      org.projects.set(projectId, {
        id: projectId,
        name: project.name,
        is_finished: project.is_finished,
        entries: [],
      })
    }

    const projectData = org.projects.get(projectId)
    if (projectData) {
      projectData.entries.push({
        started_at: entry.started_at,
        ended_at: entry.ended_at,
      })
    }
  })

  // Converter para formato de retorno
  const result = Array.from(organizationMap.values()).map((org) => ({
    organization: org.organization,
    projects: Array.from(org.projects.values())
      .map(processProject)
      .sort((a, b) => {
        const aDate = new Date(a.last_activity_date)
        const bDate = new Date(b.last_activity_date)
        return bDate.getTime() - aDate.getTime()
      }),
  }))

  return result
}
