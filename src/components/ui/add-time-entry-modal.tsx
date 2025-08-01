'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { createTimeEntry } from '@/lib/database/time-entries'
import { localTimeToUTC } from '@/lib/utils'

interface AddTimeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  userId: string
  onTimeEntryAdded: () => void
}

export function AddTimeEntryModal({
  isOpen,
  onClose,
  projectId,
  userId,
  onTimeEntryAdded,
}: AddTimeEntryModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [endTime, setEndTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!(startDate && endDate && startTime && endTime)) {
      toast.error('Preencha todos os campos')
      return
    }

    // Combinar data e hora
    const startDateTime = new Date(startDate)
    const [startHour, startMinute] = startTime.split(':').map(Number)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(endDate)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    // Usar função utilitária para consistência com o timer
    const startISO = localTimeToUTC(startDateTime)
    const endISO = localTimeToUTC(endDateTime)

    // Validar se fim é depois do início
    if (endDateTime <= startDateTime) {
      toast.error('A hora de fim deve ser posterior à hora de início')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await createTimeEntry({
        user_id: userId,
        project_id: projectId,
        started_at: startISO,
        ended_at: endISO,
      })

      if (success) {
        toast.success('Time entry adicionado com sucesso!')
        onTimeEntryAdded()
        onClose()
        // Resetar formulário
        setStartDate(new Date())
        setStartTime('')
        setEndDate(new Date())
        setEndTime('')
      } else {
        toast.error('Erro ao adicionar time entry')
      }
    } catch (error) {
      console.error('Erro ao adicionar time entry:', error)
      toast.error('Erro ao adicionar time entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-white">
            Adicionar Time Entry
          </h2>
          <Button
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            onClick={onClose}
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
                  onDateChange={setStartDate}
                  placeholder="Data de início"
                />
              </div>
              <Input
                className="appearance-none border-gray-600 bg-gray-700 text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                id="start-time"
                onChange={(e) => setStartTime(e.target.value)}
                required
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
                  onDateChange={setEndDate}
                  placeholder="Data de fim"
                />
              </div>
              <Input
                className="appearance-none border-gray-600 bg-gray-700 text-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                id="end-time"
                onChange={(e) => setEndTime(e.target.value)}
                required
                step="60"
                type="time"
                value={endTime}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <Button
              className="flex-1 cursor-pointer"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 cursor-pointer"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
