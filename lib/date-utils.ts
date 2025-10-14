import { format, formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

// Fuseau horaire de Nice (Europe/Paris)
export const TIMEZONE = 'Europe/Paris'

/**
 * Convertit une date UTC en date du fuseau horaire de Paris
 */
export function toParisTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return toZonedTime(dateObj, TIMEZONE)
}

/**
 * Formate une date en tenant compte du fuseau horaire de Paris
 */
export function formatParisDate(
  date: Date | string,
  formatStr: string = 'dd/MM/yyyy HH:mm'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, TIMEZONE, formatStr, { locale: fr })
}

/**
 * Obtient la date et l'heure actuelle à Paris
 */
export function nowInParis(): Date {
  return toParisTime(new Date())
}

/**
 * Formate une date pour l'affichage avec le fuseau horaire
 */
export function formatDateWithTimezone(date: Date | string): string {
  return formatParisDate(date, "dd/MM/yyyy 'à' HH:mm 'CET'")
}

/**
 * Formate une date courte
 */
export function formatShortDate(date: Date | string): string {
  return formatParisDate(date, 'dd/MM/yyyy')
}

/**
 * Formate une heure
 */
export function formatTime(date: Date | string): string {
  return formatParisDate(date, 'HH:mm')
}

/**
 * Calcule la durée de séjour d'un bateau
 */
export function calculateDuration(
  dateArrivee: Date | string,
  dateDepart?: Date | string | null
): string {
  const arrivee = typeof dateArrivee === 'string' ? parseISO(dateArrivee) : dateArrivee
  const depart = dateDepart
    ? typeof dateDepart === 'string'
      ? parseISO(dateDepart)
      : dateDepart
    : new Date()

  const diffMs = depart.getTime() - arrivee.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffDays > 0) {
    return `${diffDays}j ${diffHours}h`
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}min`
  } else {
    return `${diffMinutes}min`
  }
}

