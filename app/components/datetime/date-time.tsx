import { format } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { enUS } from 'date-fns/locale'

const DEFAULT_TIMEZONE = 'America/New_York'
const DEFAULT_FORMAT = 'E, MM MMM yyyy, p zzzz'

/**
 * Gets the timezone abbreviation (e.g., "PST", "EST")
 */
function getTimezoneAbbreviation(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'zzz', { locale: enUS })
}

/**
 * Get the user's local timezone from the browser
 * @returns The timezone string (e.g., "America/New_York")
 */
function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    // Fallback to UTC if timezone detection fails
    return DEFAULT_TIMEZONE
  }
}

interface DateTimeProps {
  date: string | Date
  formatStr?: string
  timezone?: string
  showTimezone?: boolean
  className?: string
}

export function formatDateTime(
  date: string | Date,
  formatStr: string = DEFAULT_FORMAT,
  timezone: string,
  showTimezone: boolean = false
): string {
  let timezoneValue = timezone
  if (!timezone) {
    timezoneValue = getBrowserTimezone()
  }

  // If date is a string without timezone indicator, add 'Z' to indicate UTC
  let dateToParse = date
  if (typeof date === 'string') {
    const trimmedDate = date.trim()
    // Check if it doesn't already end with 'z' or 'Z' (UTC indicator)
    if (!/[zZ]$/.test(trimmedDate)) {
      dateToParse = trimmedDate + 'Z'
    } else {
      dateToParse = trimmedDate
    }
  }

  const parsedDate = typeof dateToParse === 'string' ? new Date(dateToParse) : dateToParse
  const zonedDate = toZonedTime(parsedDate, timezoneValue)
  const formattedDate = format(zonedDate, formatStr)

  if (showTimezone) {
    return `${formattedDate} (${getTimezoneAbbreviation(parsedDate, timezoneValue)})`
  }

  return formattedDate
}

export default function DateTime({
  date,
  formatStr = DEFAULT_FORMAT,
  timezone,
  showTimezone = false,
  className,
}: DateTimeProps) {
  let timezoneValue = timezone
  if (!timezone) {
    timezoneValue = getBrowserTimezone()
  }

  const formattedDate = formatDateTime(
    date,
    formatStr,
    timezoneValue ?? DEFAULT_TIMEZONE,
    showTimezone
  )

  return <time className={className}>{formattedDate}</time>
}
