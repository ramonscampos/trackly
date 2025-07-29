import { Folder, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyProjectsStateProps {
  canManageProjects: boolean
  onCreateProject: () => void
}

export function EmptyProjectsState({
  canManageProjects,
  onCreateProject,
}: EmptyProjectsStateProps) {
  return (
    <div className="py-12 text-center">
      <Folder className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 font-medium text-gray-300 text-lg">
        Nenhum projeto encontrado
      </h3>
      <p className="mt-2 text-gray-500">
        Crie seu primeiro projeto para começar a trabalhar.
      </p>
      {canManageProjects && (
        <Button className="mt-4 cursor-pointer" onClick={onCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Projeto
        </Button>
      )}
    </div>
  )
}
