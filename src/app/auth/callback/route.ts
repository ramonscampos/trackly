import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createProfile, getProfileByEmail } from '@/lib/database/profiles'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')

    // Verificar se há erro no callback
    if (error) {
      console.error('OAuth callback error:', error, errorDescription)
      const redirectUrl = new URL('/login?error=oauth_error', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Verificar se o código está presente
    if (!code) {
      console.error('OAuth callback: código não encontrado')
      const redirectUrl = new URL('/login?error=no_code', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Trocar código por sessão
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Erro ao trocar código por sessão:', exchangeError.message)
      const redirectUrl = new URL('/login?error=session_error', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Verificar se a sessão foi criada com sucesso
    if (!data.session) {
      console.error('Sessão não criada após troca do código')
      const redirectUrl = new URL('/login?error=no_session', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Verificar se o usuário está presente na sessão
    if (!data.user) {
      console.error('Usuário não encontrado na sessão')
      const redirectUrl = new URL('/login?error=no_user', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    console.log('Login bem-sucedido para:', data.user.email)

    // Verificar se o profile existe, caso contrário criar
    if (data.user.email) {
      const existingProfile = await getProfileByEmail(data.user.email)

      if (!existingProfile) {
        await createProfile({
          id: data.user.id,
          email: data.user.email,
          full_name:
            data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url,
        })
      }
    }

    // Redirecionar para a página principal
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Erro inesperado no callback OAuth:', error)
    const redirectUrl = new URL('/login?error=unexpected_error', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}
