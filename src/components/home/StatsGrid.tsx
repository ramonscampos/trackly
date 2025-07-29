import { ActiveProjectsCard } from './stats/ActiveProjectsCard'
import { MonthHoursCard } from './stats/MonthHoursCard'
import { TodayHoursCard } from './stats/TodayHoursCard'
import { WeekHoursCard } from './stats/WeekHoursCard'

export function StatsGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <TodayHoursCard />
      <WeekHoursCard />
      <ActiveProjectsCard />
      <MonthHoursCard />
    </div>
  )
}
