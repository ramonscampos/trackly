import { supabase } from '@/lib/supabase-client'
import type { CreateProfile, Profile, UpdateProfile } from './types'

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil:', error)
    return null
  }

  return data
}

export async function getProfileByEmail(
  email: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil por email:', error)
    return null
  }

  return data
}

export async function createProfile(
  profile: CreateProfile
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar perfil:', error)
    return null
  }

  return data
}

export async function updateProfile(
  id: string,
  updates: UpdateProfile
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar perfil:', error)
    return null
  }

  return data
}

export async function deleteProfile(id: string): Promise<boolean> {
  const { error } = await supabase.from('profiles').delete().eq('id', id)

  if (error) {
    console.error('Erro ao deletar perfil:', error)
    return false
  }

  return true
}

export async function upsertProfile(
  profile: CreateProfile
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Erro ao upsert perfil:', error)
    return null
  }

  return data
}
