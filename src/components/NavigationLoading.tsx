'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsLoading(true)
    
    // Simular loading para navegações
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 animate-pulse" />
    </div>
  )
} 