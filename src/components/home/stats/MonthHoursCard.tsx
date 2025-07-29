'use client'

import { BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/common/StatCard'
import { getCurrentMonthHoursByUserId } from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

export function MonthHoursCard() {
  const { user } = useAuth()
  const [monthHours, setMonthHours] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHours = async () => {
      if (!user) return

      setLoading(true)
      try {
        const hours = await getCurrentMonthHoursByUserId(user.id)
        setMonthHours(hours)
      } catch (error) {
        console.error('Erro ao carregar horas do mês:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHours()
  }, [user])

  const formatHours = (hours: number): string => {
    if (hours === 0) return '0h'

    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)

    // Se for menos de 1 hora, mostrar apenas minutos
    if (wholeHours === 0) {
      return `${minutes}m`
    }

    // Se for 1 hora ou mais, mostrar horas e minutos
    return `${wholeHours}h${minutes.toString().padStart(2, '0')}m`
  }

  const getMonthName = (): string => {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ]
    return months[new Date().getMonth()]
  }

  return (
    <StatCard
      change={`${getMonthName()}`}
      changeType="neutral"
      icon={BarChart3}
      label="Total do Mês"
      value={loading ? '...' : formatHours(monthHours)}
    />
  )
}
