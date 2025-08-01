'use client'

import { ArrowLeft, Clock, Filter, TrendingUp, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getOrganizationUsersWithProfiles } from '@/lib/database/organization-users'
import { getProjectById } from '@/lib/database/projects'
import { getTimeEntriesByProjectId } from '@/lib/database/time-entries'
import type {
  OrganizationUserWithProfile,
  Project,
  TimeEntryWithDetails,
} from '@/lib/database/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface PageProps {
  params: Promise<{
    id: string
    projectId: string
  }>
}

export default function ManageTimeEntriesPage({ params }: PageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithDetails[]>([])
  const [organizationUsers, setOrganizationUsers] = useState<
    OrganizationUserWithProfile[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<
    '7days' | '15days' | 'currentMonth' | 'custom' | 'all'
  >('all')
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>()
  const [userFilter, setUserFilter] = useState<string>('all')

  const { id: organizationId, projectId } = use(params)

  const {
    canViewAllTimeEntries,
    userRole,
    isLoading: isPermissionsLoading,
  } = usePermissions(organizationId)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Verificar permissões
        if (!canViewAllTimeEntries) {
          toast.error('Você não tem permissão para gerenciar apontamentos')
          router.push(`/organizations/${organizationId}`)
          return
        }

        // Carregar projeto
        const projectData = await getProjectById(projectId)
        if (!projectData) {
          toast.error('Projeto não encontrado')
          router.push(`/organizations/${organizationId}`)
          return
        }
        setProject(projectData)

        // Carregar todos os apontamentos do projeto
        const entriesData = await getTimeEntriesByProjectId(projectId)
        setTimeEntries(entriesData)

        // Carregar usuários da organização
        const usersData = await getOrganizationUsersWithProfiles(organizationId)
        setOrganizationUsers(usersData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados')
        router.push(`/organizations/${organizationId}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && !isPermissionsLoading && userRole) {
      loadData()
    }
  }, [
    user,
    projectId,
    organizationId,
    router,
    canViewAllTimeEntries,
    isPermissionsLoading,
    userRole,
  ])

  // Agrupar apontamentos por usuário e calcular totais
  const userSummaries = useMemo(() => {
    let filtered = timeEntries

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date()
      let filterDate: Date

      switch (dateFilter) {
        case '7days':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '15days':
          filterDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
          break
        case 'currentMonth':
          // Primeiro dia do mês atual
          filterDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'custom':
          // Usar as datas personalizadas
          if (customStartDate) {
            filterDate = customStartDate
          } else {
            return []
          }
          break
        default:
          return []
      }

      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.started_at)
        const entryDateOnly = new Date(
          entryDate.getFullYear(),
          entryDate.getMonth(),
          entryDate.getDate()
        )

        if (filterDate) {
          const filterDateOnly = new Date(
            filterDate.getFullYear(),
            filterDate.getMonth(),
            filterDate.getDate()
          )
          if (entryDateOnly < filterDateOnly) {
            return false
          }
        }

        if (dateFilter === 'custom' && customEndDate) {
          const endDateOnly = new Date(
            customEndDate.getFullYear(),
            customEndDate.getMonth(),
            customEndDate.getDate()
          )
          if (entryDateOnly > endDateOnly) {
            return false
          }
        }

        return true
      })
    }

    // Filtro por usuário
    if (userFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.user_id === userFilter)
    }

    // Agrupar por usuário e calcular totais
    const userMap = new Map<
      string,
      {
        userId: string
        userName: string
        userEmail: string
        totalMinutes: number
        entryCount: number
        lastActivity: Date | null
      }
    >()

    filtered.forEach((entry) => {
      const userId = entry.user_id
      const userName =
        entry.user?.full_name ||
        entry.user?.email ||
        `Usuário #${userId.slice(0, 8)}`
      const userEmail = entry.user?.email || ''

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName,
          userEmail,
          totalMinutes: 0,
          entryCount: 0,
          lastActivity: null,
        })
      }

      const userData = userMap.get(userId)!
      userData.entryCount++

      if (entry.ended_at) {
        const start = new Date(entry.started_at)
        const end = new Date(entry.ended_at)
        const minutes = Math.floor(
          (end.getTime() - start.getTime()) / (1000 * 60)
        )
        userData.totalMinutes += minutes
      }

      const entryDate = new Date(entry.started_at)
      if (!userData.lastActivity || entryDate > userData.lastActivity) {
        userData.lastActivity = entryDate
      }
    })

    // Converter para array e ordenar por total de horas (maior primeiro)
    return Array.from(userMap.values()).sort(
      (a, b) => b.totalMinutes - a.totalMinutes
    )
  }, [timeEntries, dateFilter, userFilter, customStartDate, customEndDate])

  // Calcular total de horas dos apontamentos filtrados
  const totalHours = useMemo(() => {
    let totalMinutes = 0

    userSummaries.forEach((userSummary) => {
      totalMinutes += userSummary.totalMinutes
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return {
      hours,
      minutes,
      totalMinutes,
      formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    }
  }, [userSummaries])

  const handleBack = () => {
    router.push(`/organizations/${organizationId}`)
  }

  const formatDate = (date: string) => {
    // Extrair data e hora da string UTC sem conversão de timezone
    const dateTime = date.split('T')
    const datePart = dateTime[0].split('-')
    const timePart = dateTime[1].split(':')

    const day = datePart[2]
    const month = datePart[1]
    const year = datePart[0]
    const hour = timePart[0]
    const minute = timePart[1]

    return `${day}/${month}/${year} ${hour}:${minute}`
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

  if (!project) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" onClick={handleBack} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="font-bold text-3xl text-white">
          Gerenciar Apontamentos
        </h1>
        <p className="mt-2 text-gray-400">Projeto: {project.name}</p>
      </div>

      {/* Card de total de horas */}
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <div>
              <h3 className="font-medium text-white">Total de Horas</h3>
              <p className="text-gray-400 text-sm">
                {userSummaries.length} usuário
                {userSummaries.length !== 1 ? 's' : ''} com apontamentos
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-2xl text-green-400">
              {totalHours.formatted}
            </div>
            <p className="text-gray-500 text-xs">Tempo total</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="font-semibold text-white text-xl">
            Todos os Apontamentos
          </h2>
          <p className="text-gray-400 text-sm">
            Apontamentos de todos os usuários neste projeto
          </p>
        </div>

        <div className="flex items-center space-x-4 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3">
          {/* Filtro de usuário - PRIMEIRO */}
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <Select
              onValueChange={(value: string) => setUserFilter(value)}
              value={userFilter}
            >
              <SelectTrigger className="w-48 border-gray-600 bg-gray-700 text-white">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800 text-white">
                <SelectItem value="all">Todos os usuários</SelectItem>
                {organizationUsers.map((orgUser) => (
                  <SelectItem key={orgUser.user_id} value={orgUser.user_id}>
                    {orgUser.profile?.full_name ||
                      orgUser.profile?.email ||
                      `Usuário #${orgUser.user_id.slice(0, 8)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de período - SEGUNDO */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select
              onValueChange={(
                value: '7days' | '15days' | 'currentMonth' | 'custom' | 'all'
              ) => setDateFilter(value)}
              value={dateFilter}
            >
              <SelectTrigger className="w-52 border-gray-600 bg-gray-700 text-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800 text-white">
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="15days">Últimos 15 dias</SelectItem>
                <SelectItem value="currentMonth">Mês atual</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de período personalizado - TERCEIRO (quando custom) */}
          {dateFilter === 'custom' && (
            <div className="ml-auto flex gap-4">
              <div className="flex items-center space-x-2">
                <label
                  className="font-medium text-gray-300 text-sm"
                  htmlFor="start-date-filter"
                >
                  De:
                </label>
                <div id="start-date-filter">
                  <DatePicker
                    date={customStartDate}
                    onDateChange={setCustomStartDate}
                    placeholder="Data inicial"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label
                  className="font-medium text-gray-300 text-sm"
                  htmlFor="end-date-filter"
                >
                  Até:
                </label>
                <div id="end-date-filter">
                  <DatePicker
                    date={customEndDate}
                    onDateChange={setCustomEndDate}
                    placeholder="Data final"
                  />
                </div>
              </div>
              <Button
                className="cursor-pointer"
                onClick={() => {
                  setCustomStartDate(undefined)
                  setCustomEndDate(undefined)
                  setDateFilter('all')
                }}
                size="sm"
                variant="outline"
              >
                Limpar
              </Button>
            </div>
          )}
        </div>
      </div>

      {userSummaries.length === 0 ? (
        <div className="py-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-medium text-gray-300 text-lg">
            Nenhum apontamento encontrado
          </h3>
          <p className="mt-2 text-gray-500">
            {dateFilter === 'all' && userFilter === 'all'
              ? 'Ainda não há apontamentos neste projeto.'
              : 'Nenhum apontamento encontrado com os filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {userSummaries.map((userSummary) => {
            const hours = Math.floor(userSummary.totalMinutes / 60)
            const minutes = userSummary.totalMinutes % 60
            const formattedTime =
              hours > 0
                ? `${hours}h${minutes.toString().padStart(2, '0')}m`
                : `${minutes}m`

            return (
              <div
                className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-4 backdrop-blur-sm"
                key={userSummary.userId}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600/50">
                    <Users className="h-5 w-5 text-gray-300" />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {userSummary.userName}
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <span>
                        {userSummary.entryCount} apontamento
                        {userSummary.entryCount !== 1 ? 's' : ''}
                      </span>
                      {userSummary.lastActivity && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span>
                            Última atividade:{' '}
                            {formatDate(userSummary.lastActivity.toISOString())}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400 text-xl">
                    {formattedTime}
                  </div>
                  <p className="text-gray-500 text-xs">Total de horas</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
