'use client'

import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/common/StatCard'
import {
  getTodayHoursByUserId,
  getYesterdayHoursByUserId,
} from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

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
    if (hours === 0) return '0h'

    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)

    // Sempre mostrar minutos quando houver, mesmo que seja 0
    if (wholeHours === 0) {
      return `${minutes}m`
    }

    return `${wholeHours}h${minutes.toString().padStart(2, '0')}m`
  }

  const calculateChange = (
    today: number,
    yesterday: number
  ): { change: string; changeType: 'positive' | 'negative' | 'neutral' } => {
    if (yesterday === 0) {
      if (today === 0) {
        return { change: `${formatHours(0)} vs ontem`, changeType: 'neutral' }
      }
      return { change: '+100% vs ontem', changeType: 'positive' }
    }

    const percentage = ((today - yesterday) / yesterday) * 100

    if (percentage > 0) {
      return {
        change: `+${percentage.toFixed(0)}% vs ontem`,
        changeType: 'positive',
      }
    }
    if (percentage < 0) {
      return {
        change: `${percentage.toFixed(0)}% vs ontem`,
        changeType: 'negative',
      }
    }
    return { change: '0% vs ontem', changeType: 'neutral' }
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
