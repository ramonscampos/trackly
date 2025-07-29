'use client'

import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/common/StatCard'
import {
  getLastWeekHoursByUserId,
  getThisWeekHoursByUserId,
} from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

export function WeekHoursCard() {
  const { user } = useAuth()
  const [thisWeekHours, setThisWeekHours] = useState<number>(0)
  const [lastWeekHours, setLastWeekHours] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHours = async () => {
      if (!user) return

      setLoading(true)
      try {
        const [thisWeek, lastWeek] = await Promise.all([
          getThisWeekHoursByUserId(user.id),
          getLastWeekHoursByUserId(user.id),
        ])

        setThisWeekHours(thisWeek)
        setLastWeekHours(lastWeek)
      } catch (error) {
        console.error('Erro ao carregar horas da semana:', error)
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

  const calculateChange = (
    thisWeek: number,
    lastWeek: number
  ): { change: string; changeType: 'positive' | 'negative' | 'neutral' } => {
    if (lastWeek === 0) {
      if (thisWeek === 0) {
        return {
          change: `${formatHours(0)} vs semana passada`,
          changeType: 'neutral',
        }
      }
      return { change: '+100% vs semana passada', changeType: 'positive' }
    }

    const percentage = ((thisWeek - lastWeek) / lastWeek) * 100

    if (percentage > 0) {
      return {
        change: `+${percentage.toFixed(0)}% vs semana passada`,
        changeType: 'positive',
      }
    }
    if (percentage < 0) {
      return {
        change: `${percentage.toFixed(0)}% vs semana passada`,
        changeType: 'negative',
      }
    }
    return { change: '0% vs semana passada', changeType: 'neutral' }
  }

  const { change, changeType } = calculateChange(thisWeekHours, lastWeekHours)

  return (
    <StatCard
      change={change}
      changeType={changeType}
      icon={Calendar}
      label="Horas Esta Semana"
      value={loading ? '...' : formatHours(thisWeekHours)}
    />
  )
}
