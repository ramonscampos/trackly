'use client'

import { Clock, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { updateTimeEntry } from '@/lib/database/time-entries'
import type { TimeEntryWithDetails } from '@/lib/database/types'
import { localTimeToUTC } from '@/lib/utils'

interface EditTimeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  timeEntry: TimeEntryWithDetails | null
  onTimeEntryUpdated: () => void
}

export function EditTimeEntryModal({
  isOpen,
  onClose,
  timeEntry,
  onTimeEntryUpdated,
}: EditTimeEntryModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [startTime, setStartTime] = useState<string>('')
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [endTime, setEndTime] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (timeEntry && isOpen) {
      const startDateTime = new Date(timeEntry.started_at)
      const endDateTime = new Date(timeEntry.ended_at)

      // Definir as datas como objetos Date
      setStartDate(startDateTime)
      setEndDate(endDateTime)

      // Formatar hora para input time (HH:MM) - extrair da string UTC
      const startTimePart = timeEntry.started_at.split('T')[1].split(':')
      const endTimePart = timeEntry.ended_at.split('T')[1].split(':')
      setStartTime(`${startTimePart[0]}:${startTimePart[1]}`)
      setEndTime(`${endTimePart[0]}:${endTimePart[1]}`)
    }
  }, [timeEntry, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!timeEntry) return

    if (!(startDate && startTime && endDate && endTime)) {
      setError('Preencha todos os campos')
      return
    }

    // Criar novas datas combinando a data selecionada com o horário
    const newStartDate = new Date(startDate)
    const [startHour, startMinute] = startTime.split(':').map(Number)
    newStartDate.setHours(startHour, startMinute, 0, 0)

    const newEndDate = new Date(endDate)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    newEndDate.setHours(endHour, endMinute, 0, 0)

    if (newStartDate >= newEndDate) {
      setError('A hora de início deve ser anterior à hora de fim')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const updated = await updateTimeEntry(timeEntry.id, {
        started_at: localTimeToUTC(newStartDate),
        ended_at: localTimeToUTC(newEndDate),
      })

      if (updated) {
        onTimeEntryUpdated()
        onClose()
      } else {
        setError('Erro ao atualizar apontamento')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar apontamento'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      onClose()
    }
  }

  if (!(isOpen && timeEntry)) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        type="button"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-white text-xl">
            Editar Apontamento
          </h2>
          <Button
            className="h-8 w-8 p-0"
            disabled={isLoading}
            onClick={handleClose}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Hora de Início */}
          <div className="space-y-2">
            <label
              className="block font-medium text-gray-300 text-sm"
              htmlFor="start-date"
            >
              Data de Início
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div id="start-date">
                <DatePicker
                  date={startDate}
                  disabled={isLoading}
                  onDateChange={setStartDate}
                  placeholder="Data de início"
                />
              </div>
              <Input
                className="appearance-none border-gray-600 bg-gray-700 text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                disabled={isLoading}
                id="start-time"
                onChange={(e) => setStartTime(e.target.value)}
                step="60"
                type="time"
                value={startTime}
              />
            </div>
          </div>

          {/* Hora de Fim */}
          <div className="space-y-2">
            <label
              className="block font-medium text-gray-300 text-sm"
              htmlFor="end-date"
            >
              Data de Fim
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div id="end-date">
                <DatePicker
                  date={endDate}
                  disabled={isLoading}
                  onDateChange={setEndDate}
                  placeholder="Data de fim"
                />
              </div>
              <Input
                className="appearance-none border-gray-600 bg-gray-700 text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                disabled={isLoading}
                id="end-time"
                onChange={(e) => setEndTime(e.target.value)}
                step="60"
                type="time"
                value={endTime}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-700 bg-red-900/50 p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              className="flex-1"
              disabled={isLoading}
              onClick={handleClose}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 cursor-pointer"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
