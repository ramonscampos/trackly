'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      className="toaster group"
      style={
        {
          '--normal-bg': 'hsl(0 0% 9%)',
          '--normal-text': 'hsl(0 0% 98%)',
          '--normal-border': 'hsl(0 0% 14.9%)',
          '--success-bg': 'hsl(142.1 76.2% 36.3%)',
          '--success-text': 'hsl(355.7 100% 97.3%)',
          '--success-border': 'hsl(142.1 76.2% 36.3%)',
          '--error-bg': 'hsl(0 62.8% 30.6%)',
          '--error-text': 'hsl(0 85.7% 97.3%)',
          '--error-border': 'hsl(0 62.8% 30.6%)',
          '--warning-bg': 'hsl(48 96% 53%)',
          '--warning-text': 'hsl(0 0% 9%)',
          '--warning-border': 'hsl(48 96% 53%)',
        } as React.CSSProperties
      }
      theme="dark"
      {...props}
    />
  )
}

export { Toaster }
