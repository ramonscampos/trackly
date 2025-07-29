import { Crown, Shield, User } from 'lucide-react'
import type { UserRole } from '@/lib/hooks/usePermissions'

interface PermissionBadgeProps {
  role: UserRole
  className?: string
}

export function PermissionBadge({
  role,
  className = '',
}: PermissionBadgeProps) {
  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          icon: Crown,
          text: 'Administrador',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/20',
        }
      case 'manager':
        return {
          icon: Shield,
          text: 'Gerente',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/20',
        }
      case 'user':
        return {
          icon: User,
          text: 'Usuário',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20',
        }
      default:
        return {
          icon: User,
          text: 'Sem acesso',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
        }
    }
  }

  const config = getRoleConfig()
  const IconComponent = config.icon

  return (
    <div
      className={`inline-flex items-center space-x-2 rounded-full border px-3 py-1 font-medium text-sm ${config.bgColor} ${config.borderColor} ${config.color} ${className}`}
    >
      <IconComponent className="h-3 w-3" />
      <span>{config.text}</span>
    </div>
  )
}
