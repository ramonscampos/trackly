'use client'

import { Folder, Users } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { ProjectsTab } from './ProjectsTab'
import { UsersTab } from './UsersTab'

interface OrganizationTabsProps {
  organizationId: string
  activeTab: 'projects' | 'users'
  onTabChange: (tab: 'projects' | 'users') => void
}

export function OrganizationTabs({
  organizationId,
  activeTab,
  onTabChange,
}: OrganizationTabsProps) {
  const { canManageUsers } = usePermissions(organizationId)

  return (
    <div>
      <div className="mb-6 border-gray-700 border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`flex cursor-pointer items-center space-x-2 border-b-2 px-1 py-2 font-medium text-sm transition-colors ${
              activeTab === 'projects'
                ? 'border-gray-300 text-gray-300'
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
            }`}
            onClick={() => onTabChange('projects')}
            type="button"
          >
            <Folder className="h-4 w-4" />
            <span>Projetos</span>
          </button>

          {canManageUsers && (
            <button
              className={`flex cursor-pointer items-center space-x-2 border-b-2 px-1 py-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-gray-300 text-gray-300'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
              }`}
              onClick={() => onTabChange('users')}
              type="button"
            >
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </button>
          )}
        </nav>
      </div>

      <div>
        {activeTab === 'projects' && (
          <ProjectsTab organizationId={organizationId} />
        )}

        {activeTab === 'users' && <UsersTab organizationId={organizationId} />}
      </div>
    </div>
  )
}
