interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export function LoadingSpinner({
  message = 'Carregando...',
  size = 'md',
  fullScreen = true,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const content = (
    <div className="text-center">
      <div
        className={`mx-auto animate-spin rounded-full border-2 border-gray-600 border-t-gray-300 ${sizeClasses[size]}`}
      />
      {message && <p className="mt-4 text-gray-400">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {content}
      </div>
    )
  }

  return content
}
