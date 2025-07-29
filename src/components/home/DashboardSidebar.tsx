'use client'

import { TimerCard } from '@/components/dashboard/TimerCard'
import { useAuth } from '@/lib/hooks/useAuth'

interface DashboardSidebarProps {
  onRefreshProjects?: () => void
}

export function DashboardSidebar({ onRefreshProjects }: DashboardSidebarProps) {
  const { user } = useAuth()

  const handleTimerStopped = () => {
    if (onRefreshProjects) {
      onRefreshProjects()
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <TimerCard onTimerStopped={handleTimerStopped} userId={user.id} />
      {/* <ActivityCard activities={activities} /> */}
    </div>
  )
}
