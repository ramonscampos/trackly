'use client'

import {
  ArrowLeft,
  Clock,
  Edit,
  Filter,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useCallback, useEffect, useMemo, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AddTimeEntryModal } from '@/components/ui/add-time-entry-modal'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteModal } from '@/components/ui/confirm-delete-modal'
import { DatePicker } from '@/components/ui/date-picker'
import { EditTimeEntryModal } from '@/components/ui/edit-time-entry-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProjectById } from '@/lib/database/projects'
import {
  deleteTimeEntry,
  getUserTimeEntriesByProjectId,
} from '@/lib/database/time-entries'
import type { Project, TimeEntryWithDetails } from '@/lib/database/types'
import { useAuth } from '@/lib/hooks/useAuth'

interface PageProps {
  params: Promise<{
    id: string
    projectId: string
  }>
}

export default function ProjectTimeEntriesPage({ params }: PageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<
    '7days' | '15days' | 'currentMonth' | 'custom' | 'all'
  >('all')
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>()
  const [editingTimeEntry, setEditingTimeEntry] =
    useState<TimeEntryWithDetails | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingTimeEntry, setDeletingTimeEntry] =
    useState<TimeEntryWithDetails | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { id: organizationId, projectId } = use(params)

  const loadData = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Carregar projeto
      const projectData = await getProjectById(projectId)
      if (!projectData) {
        alert('Projeto não encontrado')
        router.push(`/organizations/${organizationId}`)
        return
      }
      setProject(projectData)

      // Carregar apenas os apontamentos do usuário
      const entriesData = await getUserTimeEntriesByProjectId(
        projectId,
        user.id
      )
      setTimeEntries(entriesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados')
      router.push(`/organizations/${organizationId}`)
    } finally {
      setIsLoading(false)
    }
  }, [user, projectId, organizationId, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, loadData])

  // Filtrar apontamentos por data
  const filteredEntries = useMemo(() => {
    if (dateFilter === 'all') return timeEntries

    const now = new Date()
    let filterStartDate: Date | undefined
    let filterEndDate: Date | undefined

    switch (dateFilter) {
      case '7days':
        filterStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '15days':
        filterStartDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
        break
      case 'currentMonth':
        // Primeiro dia do mês atual
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'custom':
        filterStartDate = customStartDate
        filterEndDate = customEndDate
        break
      default:
        return timeEntries
    }

    return timeEntries.filter((entry) => {
      const entryDate = new Date(entry.started_at)
      const entryDateOnly = new Date(
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate()
      )

      if (filterStartDate) {
        const startDateOnly = new Date(
          filterStartDate.getFullYear(),
          filterStartDate.getMonth(),
          filterStartDate.getDate()
        )
        if (entryDateOnly < startDateOnly) {
          return false
        }
      }

      if (filterEndDate) {
        const endDateOnly = new Date(
          filterEndDate.getFullYear(),
          filterEndDate.getMonth(),
          filterEndDate.getDate()
        )
        if (entryDateOnly > endDateOnly) {
          return false
        }
      }

      return true
    })
  }, [timeEntries, dateFilter, customStartDate, customEndDate])

  // Agrupar apontamentos por dia
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: TimeEntryWithDetails[] } = {}

    filteredEntries.forEach((entry) => {
      // Usar data UTC para agrupamento (extrair YYYY-MM-DD da string UTC)
      const utcDateString = entry.started_at.split('T')[0] // Pega só a parte da data
      const dateKey = utcDateString

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(entry)
    })

    // Converter para array e ordenar por data (mais recente primeiro)
    return Object.entries(groups)
      .map(([dateKey, entries]) => {
        // Criar data UTC a partir da chave YYYY-MM-DD
        const [year, month, day] = dateKey.split('-').map(Number)
        const date = new Date(Date.UTC(year, month - 1, day)) // Usar UTC para evitar conversão de fuso horário

        return {
          dateKey,
          date,
          entries: entries.sort(
            (a, b) =>
              new Date(b.started_at).getTime() -
              new Date(a.started_at).getTime()
          ),
        }
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [filteredEntries])

  // Calcular total de horas dos apontamentos filtrados
  const totalHours = useMemo(() => {
    let totalMinutes = 0

    filteredEntries.forEach((entry) => {
      if (entry.ended_at) {
        const start = new Date(entry.started_at)
        const end = new Date(entry.ended_at)
        totalMinutes += Math.floor(
          (end.getTime() - start.getTime()) / (1000 * 60)
        )
      }
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return {
      hours,
      minutes,
      totalMinutes,
      formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    }
  }, [filteredEntries])

  const handleBack = () => {
    router.push(`/organizations/${organizationId}`)
  }

  const handleEditTimeEntry = (timeEntry: TimeEntryWithDetails) => {
    setEditingTimeEntry(timeEntry)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingTimeEntry(null)
  }

  const handleTimeEntryUpdated = () => {
    // Recarregar os dados após a edição
    if (user) {
      loadData()
    }
  }

  const handleAddTimeEntry = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  const handleTimeEntryAdded = () => {
    loadData() // Recarregar dados
  }

  const handleDeleteTimeEntry = (timeEntry: TimeEntryWithDetails) => {
    setDeletingTimeEntry(timeEntry)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingTimeEntry(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTimeEntry) return

    setIsDeleting(true)
    try {
      const success = await deleteTimeEntry(deletingTimeEntry.id)
      if (success) {
        handleTimeEntryUpdated()
        handleCloseDeleteModal()
      } else {
        alert('Erro ao deletar apontamento')
      }
    } catch (error) {
      console.error('Erro ao deletar apontamento:', error)
      alert('Erro ao deletar apontamento')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDuration = (startedAt: string, endedAt: string) => {
    const start = new Date(startedAt)
    const end = new Date(endedAt)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes.toString().padStart(2, '0')}m`
    }
    return `${diffMinutes}m`
  }

  const formatTime = (date: string) => {
    // Extrair apenas a parte da hora da string UTC (HH:MM)
    const timePart = date.split('T')[1].split(':')
    const hours = timePart[0]
    const minutes = timePart[1]
    return `${hours}:${minutes}`
  }

  const formatDayDate = (date: Date) => {
    // Usar UTC para evitar conversão de timezone
    const day = date.getUTCDate().toString().padStart(2, '0')
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = date.getUTCFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDayOfWeek = (date: Date) => {
    const days = [
      'domingo',
      'segunda-feira',
      'terça-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sábado',
    ]
    return days[date.getUTCDay()]
  }

  const calculateDayTotal = (entries: TimeEntryWithDetails[]) => {
    let totalMinutes = 0

    entries.forEach((entry) => {
      if (entry.ended_at) {
        const start = new Date(entry.started_at)
        const end = new Date(entry.ended_at)
        totalMinutes += Math.floor(
          (end.getTime() - start.getTime()) / (1000 * 60)
        )
      }
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}m`
    }
    return `${minutes}m`
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
        <div className="mb-4 flex items-center justify-between">
          <Button onClick={handleBack} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            className="cursor-pointer"
            onClick={handleAddTimeEntry}
            size="sm"
          >
            <Clock className="mr-2 h-4 w-4" />
            Adicionar Apontamento
          </Button>
        </div>
        <h1 className="font-bold text-3xl text-white">Meus Apontamentos</h1>
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
                {filteredEntries.length} apontamento
                {filteredEntries.length !== 1 ? 's' : ''} no período
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

      {/* Filtro de data */}
      <div className="mb-6 flex items-center">
        <div>
          <h2 className="font-semibold text-white text-xl">
            Histórico de Apontamentos
          </h2>
          <p className="text-gray-400 text-sm">
            Seus lançamentos de horas neste projeto
          </p>
        </div>
        <div className="mr-4 ml-auto flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select
            onValueChange={(
              value: '7days' | '15days' | 'currentMonth' | 'custom' | 'all'
            ) => setDateFilter(value)}
            value={dateFilter}
          >
            <SelectTrigger className="w-52 border-gray-600 bg-gray-700 text-white">
              <SelectValue placeholder="Filtrar por período" />
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

        {/* Filtro de período personalizado */}
        {dateFilter === 'custom' && (
          <div className="flex items-center space-x-4 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2">
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

      {groupedEntries.length === 0 ? (
        <div className="py-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 font-medium text-gray-300 text-lg">
            Nenhum apontamento encontrado
          </h3>
          <p className="mt-2 text-gray-500">
            {dateFilter === 'all'
              ? 'Você ainda não fez apontamentos neste projeto.'
              : 'Nenhum apontamento encontrado no período selecionado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEntries.map((dayGroup) => (
            <div
              className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm"
              key={dayGroup.dateKey}
            >
              {/* Cabeçalho do dia */}
              <div className="border-gray-700 border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {formatDayDate(dayGroup.date)}
                    </h3>
                    <p className="text-gray-400 text-sm capitalize">
                      {formatDayOfWeek(dayGroup.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400 text-lg">
                      {calculateDayTotal(dayGroup.entries)}
                    </div>
                    <p className="text-gray-500 text-xs">Total do dia</p>
                  </div>
                </div>
              </div>

              {/* Lista de apontamentos do dia */}
              <div className="p-4">
                <div className="space-y-3">
                  {dayGroup.entries.map((entry) => (
                    <div
                      className="flex items-center justify-between rounded-lg bg-gray-700/30 p-3"
                      key={entry.id}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-600/50">
                          <Clock className="h-4 w-4 text-gray-300" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-medium text-green-400">
                              {formatDuration(entry.started_at, entry.ended_at)}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">
                              {formatTime(entry.started_at)} -{' '}
                              {formatTime(entry.ended_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          className="h-8 w-8 cursor-pointer p-0"
                          onClick={() => handleEditTimeEntry(entry)}
                          size="sm"
                          variant="ghost"
                        >
                          <Edit className="h-4 w-4 text-gray-400" />
                        </Button>
                        <Button
                          className="h-8 w-8 cursor-pointer p-0"
                          onClick={() => handleDeleteTimeEntry(entry)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      <EditTimeEntryModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onTimeEntryUpdated={handleTimeEntryUpdated}
        timeEntry={editingTimeEntry}
      />

      {/* Modal de Confirmação de Deletar */}
      <ConfirmDeleteModal
        isLoading={isDeleting}
        isOpen={isDeleteModalOpen}
        message={`Tem certeza que deseja deletar este apontamento de ${formatDuration(
          deletingTimeEntry?.started_at || '',
          deletingTimeEntry?.ended_at || ''
        )}? Esta ação não pode ser desfeita.`}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Deletar Apontamento"
      />

      {/* Modal de Adicionar Time Entry */}
      <AddTimeEntryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onTimeEntryAdded={handleTimeEntryAdded}
        projectId={projectId}
        userId={user.id}
      />
    </>
  )
}
