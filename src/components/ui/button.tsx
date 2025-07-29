import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-gray-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'border border-gray-600 bg-gray-700 text-white shadow-sm hover:bg-gray-600',
        destructive:
          'border border-red-500 bg-red-500 text-white shadow-sm hover:bg-red-700',
        outline:
          'border border-gray-600 bg-transparent text-gray-300 shadow-sm hover:bg-gray-700 hover:text-white',
        secondary:
          'border border-gray-600 bg-gray-800 text-gray-300 shadow-sm hover:bg-gray-700',
        ghost: 'text-gray-400 hover:bg-gray-800 hover:text-white',
        link: 'text-gray-400 underline-offset-4 hover:text-white hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  )
}

export { Button, buttonVariants }
