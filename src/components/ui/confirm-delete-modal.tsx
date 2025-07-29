'use client'

import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isLoading?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-white text-xl">{title}</h2>
          <Button
            className="h-8 w-8 p-0"
            disabled={isLoading}
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300">{message}</p>
        </div>

        <div className="flex space-x-3">
          <Button
            className="flex-1"
            disabled={isLoading}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 cursor-pointer"
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                Deletando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
