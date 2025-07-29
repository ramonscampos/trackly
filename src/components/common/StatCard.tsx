import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

export function StatCard({
  icon: Icon,
  value,
  label,
  change,
  changeType,
}: StatCardProps) {
  const getIconBgColor = () => {
    switch (label) {
      case 'Horas Hoje':
        return 'bg-blue-500/20'
      case 'Horas Esta Semana':
        return 'bg-indigo-500/20'
      case 'Projetos Ativos':
        return 'bg-purple-500/20'
      case 'Total do Mês':
        return 'bg-orange-500/20'
      default:
        return 'bg-gray-500/20'
    }
  }

  const getIconColor = () => {
    switch (label) {
      case 'Horas Hoje':
        return 'text-blue-400'
      case 'Horas Esta Semana':
        return 'text-indigo-400'
      case 'Projetos Ativos':
        return 'text-purple-400'
      case 'Total do Mês':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-400'
      case 'negative':
        return 'text-red-400'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="cursor-pointer rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-colors hover:bg-gray-800/70">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-400 text-sm">{label}</p>
          <p className="font-bold text-2xl text-white">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${getIconBgColor()}`}
        >
          <Icon className={`h-6 w-6 ${getIconColor()}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-sm">
        {change && (
          <div className="flex items-center">
            {changeType === 'positive' && (
              <TrendingUp className="mr-1 h-4 w-4 text-green-400" />
            )}
            {changeType === 'negative' && (
              <TrendingDown className="mr-1 h-4 w-4 text-red-400" />
            )}
          </div>
        )}
        <span className={getChangeColor()}>{change}</span>
      </div>
    </div>
  )
}
