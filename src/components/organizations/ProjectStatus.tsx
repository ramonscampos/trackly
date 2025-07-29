import { CheckCircle, CheckSquare } from 'lucide-react'

interface ProjectStatusProps {
  isFinished: boolean
}

export function ProjectStatus({ isFinished }: ProjectStatusProps) {
  const getStatusIcon = () => {
    if (!isFinished) {
      return <CheckCircle className="h-4 w-4 text-green-400" />
    }
    return <CheckSquare className="h-4 w-4 text-blue-400" />
  }

  const getStatusText = () => {
    return isFinished ? 'Finalizado' : 'Ativo'
  }

  return (
    <div className="mb-4 flex items-center space-x-2 text-gray-400 text-sm">
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  )
}
