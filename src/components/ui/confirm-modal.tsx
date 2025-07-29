'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!(isOpen && mounted)) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-400',
          button: 'bg-red-500 hover:bg-red-600 text-white border-red-500',
          border: 'border-red-500/20',
        }
      case 'warning':
        return {
          icon: 'text-yellow-400',
          button:
            'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600',
          border: 'border-yellow-600/20',
        }
      case 'info':
        return {
          icon: 'text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
          border: 'border-blue-600/20',
        }
    }
  }

  const styles = getVariantStyles()

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md transform rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl transition-all">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
            <h3 className="font-semibold text-lg text-white">{title}</h3>
          </div>
          <Button
            className="h-8 w-8 p-0"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button className={styles.button} onClick={handleConfirm}>
            {confirmText}
          </Button>
          <Button className="flex-1" onClick={onClose} variant="outline">
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
