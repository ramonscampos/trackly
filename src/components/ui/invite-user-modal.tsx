'use client'

import { Mail, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createOrganizationInvite } from '@/lib/database/organization-users'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  onInviteSent: () => void
}

export function InviteUserModal({
  isOpen,
  onClose,
  organizationId,
  onInviteSent,
}: InviteUserModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'manager' | 'user'>('user')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email é obrigatório')
      return
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Email inválido')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await createOrganizationInvite(
        organizationId,
        email.trim(),
        role
      )

      if (success) {
        onInviteSent()
        handleClose()
      } else {
        setError('Erro ao enviar convite. Tente novamente.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar convite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setEmail('')
      setRole('user')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        type="button"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-white text-xl">Convidar Usuário</h2>
          <Button
            className="h-8 w-8 p-0"
            disabled={isLoading}
            onClick={handleClose}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="space-y-2">
            <label
              className="block font-medium text-gray-300 text-sm"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-10 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                type="email"
                value={email}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label
              className="block font-medium text-gray-300 text-sm"
              htmlFor="role"
            >
              Função
            </label>
            <Select
              disabled={isLoading}
              onValueChange={(value: 'admin' | 'manager' | 'user') =>
                setRole(value)
              }
              value={role}
            >
              <SelectTrigger className="border-gray-600 bg-gray-700 text-white">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800 text-white">
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-700 bg-red-900/50 p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              className="flex-1"
              disabled={isLoading}
              onClick={handleClose}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 cursor-pointer"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
