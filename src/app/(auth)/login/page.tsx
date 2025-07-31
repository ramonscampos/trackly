'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import {
  AlertCircle,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase-client'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se há parâmetros de erro na URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        oauth_error: 'Erro durante a autenticação. Tente novamente.',
        no_code:
          'Código de autorização não encontrado. Tente fazer login novamente.',
        session_error: 'Erro ao criar sessão. Tente novamente.',
        no_session: 'Sessão não foi criada. Tente novamente.',
        no_user: 'Usuário não encontrado. Tente novamente.',
        unexpected_error: 'Erro inesperado. Tente novamente.',
      }

      setError(
        errorMessages[errorParam] || 'Erro desconhecido. Tente novamente.'
      )

      // Limpar o parâmetro de erro da URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)]" />
        </div>

        <div className="absolute top-20 left-20 h-32 w-32 animate-pulse rounded-full border border-gray-600 opacity-20" />
        <div className="absolute top-40 right-32 h-24 w-24 animate-ping rounded-full border border-gray-500 opacity-30" />
        <div className="absolute bottom-32 left-32 h-16 w-16 animate-bounce rounded-full bg-gray-600 opacity-40" />

        <div className="absolute inset-0 opacity-10">
          <div className="grid h-full grid-cols-12 gap-4">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                className="h-1 w-1 animate-pulse rounded-full bg-gray-400"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-16 text-white">
          <div className="mb-12 text-center">
            <div className="mb-6 flex items-center justify-center">
              <div className="relative">
                <Clock className="h-16 w-16 animate-pulse text-gray-300" />
                <div className="-top-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-600">
                  <Zap className="h-3 w-3 text-gray-900" />
                </div>
              </div>
            </div>
            <h1 className="mb-4 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text font-bold text-6xl text-transparent">
              Trackly
            </h1>
            <p className="font-light text-gray-400 text-xl">
              Gestão inteligente de horas trabalhadas
            </p>
          </div>

          <div className="max-w-md space-y-8">
            <div className="group flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 transition-colors group-hover:bg-gray-700">
                <Clock className="h-6 w-6 text-gray-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-200">Controle de Tempo</h3>
                <p className="text-gray-500 text-sm">
                  Acompanhe suas horas com precisão
                </p>
              </div>
            </div>

            <div className="group flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 transition-colors group-hover:bg-gray-700">
                <BarChart3 className="h-6 w-6 text-gray-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-200">
                  Relatórios Detalhados
                </h3>
                <p className="text-gray-500 text-sm">
                  Analise sua produtividade
                </p>
              </div>
            </div>

            <div className="group flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 transition-colors group-hover:bg-gray-700">
                <Target className="h-6 w-6 text-gray-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-200">
                  Gestão de Projetos
                </h3>
                <p className="text-gray-500 text-sm">
                  Organize seu trabalho por projetos
                </p>
              </div>
            </div>

            <div className="group flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 transition-colors group-hover:bg-gray-700">
                <TrendingUp className="h-6 w-6 text-gray-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-200">
                  Aumente Produtividade
                </h3>
                <p className="text-gray-500 text-sm">
                  Otimize seu tempo de trabalho
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 flex items-center justify-center">
              <Clock className="h-12 w-12 text-gray-300" />
            </div>
            <h1 className="mb-2 font-bold text-3xl text-white">Trackly</h1>
            <p className="text-gray-400">Gestão inteligente de horas</p>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 text-center">
              <h2 className="mb-2 font-bold text-2xl text-white">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-400">
                Entre com sua conta Google para começar
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-700 bg-red-900/50 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                  <Button
                    className="h-auto p-0 text-red-400 hover:bg-transparent hover:text-red-200"
                    onClick={() => setError(null)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <Auth
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#6B7280',
                        brandAccent: '#4B5563',
                        brandButtonText: '#FFFFFF',
                        defaultButtonBackground: '#374151',
                        defaultButtonBackgroundHover: '#4B5563',
                        defaultButtonBorder: '#6B7280',
                        defaultButtonText: '#FFFFFF',
                        dividerBackground: '#374151',
                        inputBackground: '#1F2937',
                        inputBorder: '#4B5563',
                        inputBorderHover: '#6B7280',
                        inputBorderFocus: '#9CA3AF',
                        inputText: '#FFFFFF',
                        inputLabelText: '#D1D5DB',
                        inputPlaceholder: '#9CA3AF',
                        messageText: '#D1D5DB',
                        messageTextDanger: '#FCA5A5',
                        anchorTextColor: '#9CA3AF',
                        anchorTextHoverColor: '#D1D5DB',
                      },
                      borderWidths: {
                        buttonBorderWidth: '1px',
                        inputBorderWidth: '1px',
                      },
                      fonts: {
                        bodyFontFamily: 'Inter, system-ui, sans-serif',
                        buttonFontFamily: 'Inter, system-ui, sans-serif',
                        inputFontFamily: 'Inter, system-ui, sans-serif',
                        labelFontFamily: 'Inter, system-ui, sans-serif',
                      },
                    },
                  },
                }}
                localization={{
                  variables: {
                    sign_in: {
                      social_provider_text: 'Entrar com Google',
                    },
                  },
                }}
                onlyThirdPartyProviders={true}
                providers={['google']}
                redirectTo={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/auth/callback`
                    : ''
                }
                showLinks={false}
                supabaseClient={supabase}
                view="sign_in"
              />
            </div>

            <div className="mt-8 border-gray-700 border-t pt-6 text-center">
              <p className="text-gray-500 text-xs">
                Ao entrar, você concorda com nossos{' '}
                <span className="cursor-pointer text-gray-400 hover:text-gray-300">
                  Termos de Serviço
                </span>{' '}
                e{' '}
                <span className="cursor-pointer text-gray-400 hover:text-gray-300">
                  Política de Privacidade
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Precisa de ajuda?{' '}
              <span className="cursor-pointer text-gray-400 hover:text-gray-300">
                Entre em contato
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
