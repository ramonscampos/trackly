'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Building, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { startTimer } from '@/lib/database/time-entries'
import { getOrganizationsByUserId } from '@/lib/database/organizations'
import { getProjectsByOrganizationId } from '@/lib/database/projects'
import type { Organization, Project } from '@/lib/database/types'

interface StartTimerModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onTimerStarted: () => void
}

export function StartTimerModal({
  isOpen,
  onClose,
  userId,
  onTimerStarted,
}: StartTimerModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadOrganizations()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedOrganization) {
      loadProjects(selectedOrganization)
      setSelectedProject('')
    } else {
      setProjects([])
      setSelectedProject('')
    }
  }, [selectedOrganization])

  const loadOrganizations = async () => {
    try {
      const orgs = await getOrganizationsByUserId(userId)
      setOrganizations(orgs)
    } catch (error) {
      console.error('Erro ao carregar organizações:', error)
      setError('Erro ao carregar organizações')
    }
  }

  const loadProjects = async (organizationId: string) => {
    try {
      const projs = await getProjectsByOrganizationId(organizationId)
      setProjects(projs.filter(project => !project.is_finished)) // Apenas projetos ativos
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
      setError('Erro ao carregar projetos')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrganization) {
      setError('Selecione uma organização')
      return
    }

    if (!selectedProject) {
      setError('Selecione um projeto')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const timer = await startTimer(userId, selectedProject)
      if (timer) {
        onTimerStarted()
        onClose()
      } else {
        setError('Erro ao iniciar timer')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao iniciar timer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setSelectedOrganization('')
      setSelectedProject('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Iniciar Timer</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Organização */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Organização
            </label>
            <Select
              value={selectedOrganization}
              onValueChange={setSelectedOrganization}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full border-gray-600 bg-gray-700 text-white focus:border-gray-500 focus:ring-gray-500 hover:bg-gray-600">
                <SelectValue placeholder="Selecione uma organização" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800 text-white">
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{org.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Projeto */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Projeto
            </label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
              disabled={isLoading || !selectedOrganization}
            >
              <SelectTrigger className="w-full border-gray-600 bg-gray-700 text-white focus:border-gray-500 focus:ring-gray-500 hover:bg-gray-600">
                <SelectValue 
                  placeholder={
                    selectedOrganization 
                      ? 'Selecione um projeto' 
                      : 'Primeiro selecione uma organização'
                  } 
                />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800 text-white">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-gray-400" />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOrganization && projects.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Nenhum projeto ativo encontrado nesta organização
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-700 bg-red-900/50 p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
              disabled={isLoading || !selectedOrganization || !selectedProject}
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Iniciar Timer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 