'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Selecione uma data',
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'w-full justify-start border-gray-600 bg-gray-700 text-left font-normal text-white hover:bg-gray-600 focus:border-gray-500 focus:ring-gray-500',
            !date && 'text-gray-400'
          )}
          disabled={disabled}
          variant="outline"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'dd/MM/yyyy', { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border-gray-700 bg-gray-800 p-0"
      >
        <Calendar
          initialFocus
          locale={ptBR}
          mode="single"
          onSelect={onDateChange}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  )
}
