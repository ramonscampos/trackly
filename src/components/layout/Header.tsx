'use client'

import { Clock, LogOut, Search, User as UserIcon, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  userEmail: string
  userAvatar?: string
  onSignOut: () => void
}

export function Header({ userEmail, userAvatar, onSignOut }: HeaderProps) {
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
            <div className="hidden items-center space-x-2 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 sm:flex">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                className="w-48 bg-transparent text-gray-300 text-sm placeholder-gray-500 focus:outline-none"
                placeholder="Buscar projetos..."
                type="text"
              />
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
