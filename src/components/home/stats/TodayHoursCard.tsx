'use client'

import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/common/StatCard'
import {
  getTodayHoursByUserId,
  getYesterdayHoursByUserId,
} from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatHoursToDisplay } from '@/lib/utils'

export function TodayHoursCard() {
  const { user } = useAuth()
  const [todayHours, setTodayHours] = useState<number>(0)
  const [yesterdayHours, setYesterdayHours] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHours = async () => {
      if (!user) return

      setLoading(true)
      try {
        const [today, yesterday] = await Promise.all([
          getTodayHoursByUserId(user.id),
          getYesterdayHoursByUserId(user.id),
        ])

        setTodayHours(today)
        setYesterdayHours(yesterday)
      } catch (error) {
        console.error('Erro ao carregar horas de hoje:', error)
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
    today: number,
    yesterday: number
  ): { change: string; changeType: 'positive' | 'negative' | 'neutral' } => {
    const difference = today - yesterday

    if (difference === 0) {
      return { change: `${formatHours(0)} vs ontem`, changeType: 'neutral' }
    }

    if (difference > 0) {
      return {
        change: `+${formatHours(difference)} vs ontem`,
        changeType: 'positive',
      }
    }

    return {
      change: `${formatHours(Math.abs(difference))} vs ontem`,
      changeType: 'negative',
    }
  }

  const { change, changeType } = calculateChange(todayHours, yesterdayHours)

  return (
    <StatCard
      change={change}
      changeType={changeType}
      icon={Clock}
      label="Horas Hoje"
      value={loading ? '...' : formatHours(todayHours)}
    />
  )
}
