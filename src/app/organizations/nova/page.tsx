'use client'

import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { createOrganization } from '@/lib/database/organizations'
import { useAuth } from '@/lib/hooks/useAuth'

export default function NewOrganizationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!(name.trim() && user)) return

    setIsSubmitting(true)
    try {
      const newOrg = await createOrganization({
        name: name.trim(),
        created_by: user.id,
      })

      if (newOrg) {
        router.push('/organizacoes')
      } else {
        alert('Erro ao criar organização')
      }
    } catch (error) {
      console.error('Erro ao criar organização:', error)
      alert('Erro ao criar organização')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/organizations')
  }

  if (!user) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" onClick={handleCancel} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="font-bold text-3xl text-white">Nova Organização</h1>
        <p className="mt-2 text-gray-400">
          Crie uma nova organização para gerenciar seus projetos
        </p>
      </div>

      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block font-medium text-gray-300 text-sm"
              htmlFor="name"
            >
              Nome da Organização
            </label>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              disabled={isSubmitting}
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da organização"
              required
              type="text"
              value={name}
            />
          </div>

          <div className="flex space-x-4 pt-6">
            <Button disabled={!name.trim() || isSubmitting} type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Criando...' : 'Criar Organização'}
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleCancel}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
