import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula o tempo total em minutos entre duas datas
 */
export function calculateTimeInMinutes(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return (end.getTime() - start.getTime()) / (1000 * 60)
}

/**
 * Formata minutos em formato de horas e minutos
 */
export function formatMinutesToHours(minutes: number): string {
  if (minutes === 0) return '0h'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)

  if (hours === 0) {
    return `${remainingMinutes}m`
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}m`
}

/**
 * Calcula e formata o tempo entre duas datas
 */
export function calculateAndFormatTime(
  startDate: string,
  endDate: string
): string {
  const minutes = calculateTimeInMinutes(startDate, endDate)
  return formatMinutesToHours(minutes)
}

/**
 * Formata horas decimais em formato de horas e minutos
 */
export function formatHoursToDisplay(hours: number): string {
  if (hours === 0) return '0h'

  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (wholeHours === 0) {
    return `${minutes}m`
  }

  return `${wholeHours}h${minutes.toString().padStart(2, '0')}m`
}

/**
 * Converte horário local para UTC preservando o horário local
 * Usado para salvar time entries sem conversão de timezone
 */
export function localTimeToUTC(date: Date): string {
  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  ).toISOString()
}
