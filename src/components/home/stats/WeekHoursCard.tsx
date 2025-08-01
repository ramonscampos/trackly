'use client'

import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/common/StatCard'
import {
  getLastWeekHoursByUserId,
  getThisWeekHoursByUserId,
} from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatHoursToDisplay } from '@/lib/utils'

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
    return formatHoursToDisplay(hours)
  }

  const calculateChange = (
    thisWeek: number,
    lastWeek: number
  ): { change: string; changeType: 'positive' | 'negative' | 'neutral' } => {
    const difference = thisWeek - lastWeek

    if (difference === 0) {
      return {
        change: `${formatHours(0)} vs semana passada`,
        changeType: 'neutral',
      }
    }

    if (difference > 0) {
      return {
        change: `+${formatHours(difference)} vs semana passada`,
        changeType: 'positive',
      }
    }

    return {
      change: `${formatHours(Math.abs(difference))} vs semana passada`,
      changeType: 'negative',
    }
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
