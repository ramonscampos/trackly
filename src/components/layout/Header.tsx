'use client'

import {
  Building,
  Clock,
  Folder,
  LogOut,
  Search,
  User as UserIcon,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getUserAllProjects } from '@/lib/database/time-entries'
import { useAuth } from '@/lib/hooks/useAuth'

interface HeaderProps {
  userEmail: string
  userAvatar?: string
  onSignOut: () => void
}

export function Header({ userEmail, userAvatar, onSignOut }: HeaderProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      name: string
      organization: string
      organizationId: string
    }>
  >([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length >= 2 && user) {
      try {
        const projects = await getUserAllProjects(user.id)
        const allProjects = projects.flatMap((org) =>
          org.projects.map((project) => ({
            id: project.id,
            name: project.name,
            organization: org.organization.name,
            organizationId: org.organization.id,
          }))
        )

        const filtered = allProjects.filter(
          (project) =>
            project.name.toLowerCase().includes(value.toLowerCase()) ||
            project.organization.toLowerCase().includes(value.toLowerCase())
        )

        setSearchResults(filtered.slice(0, 5)) // Limitar a 5 resultados
        setIsSearchOpen(true)
      } catch (error) {
        console.error('Erro ao buscar projetos:', error)
      }
    } else {
      setSearchResults([])
      setIsSearchOpen(false)
    }
  }
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-gray-700 border-b bg-gray-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Clock className="h-8 w-8 text-gray-300" />
                <div className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-600">
                  <Zap className="h-2 w-2 text-gray-900" />
                </div>
              </div>
              <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text font-bold text-transparent text-xl">
                Trackly
              </h1>
            </div>

            <nav className="hidden space-x-6 md:flex">
              <Link
                className="cursor-pointer text-gray-300 transition-colors hover:text-white"
                href="/"
              >
                Dashboard
              </Link>
              <Link
                className="cursor-pointer text-gray-400 transition-colors hover:text-gray-300"
                href="/organizations"
              >
                Organizações
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block" ref={searchRef}>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  className="w-48 bg-transparent text-gray-300 text-sm placeholder-gray-500 focus:outline-none"
                  onChange={handleSearchChange}
                  onFocus={() =>
                    searchTerm.length >= 2 && setIsSearchOpen(true)
                  }
                  placeholder="Buscar projetos..."
                  type="text"
                  value={searchTerm}
                />
              </div>

              {/* Dropdown de resultados */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full right-0 left-0 mt-1 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
                  {searchResults.map((project) => (
                    <Link
                      className="flex items-center space-x-3 px-3 py-2 text-gray-300 transition-colors hover:bg-gray-700"
                      href={`/organizations/${project.organizationId}/projects/${project.id}/time-entries`}
                      key={project.id}
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchTerm('')
                      }}
                    >
                      <Folder className="h-4 w-4 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm">
                          {project.name}
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500 text-xs">
                          <Building className="h-3 w-3" />
                          <span className="truncate">
                            {project.organization}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {userAvatar ? (
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                    <Image
                      alt="Avatar do usuário"
                      className="h-full w-full object-cover"
                      height={32}
                      src={userAvatar}
                      width={32}
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-gray-600 to-gray-700">
                    <UserIcon className="h-4 w-4 text-gray-300" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="font-medium text-gray-200 text-sm">
                    {userEmail}
                  </p>
                </div>
              </div>
              <Button
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500"
                onClick={onSignOut}
                size="sm"
                variant="outline"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
