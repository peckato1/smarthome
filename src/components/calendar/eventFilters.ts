import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isBetween from 'dayjs/plugin/isBetween'
import Duration from 'dayjs/plugin/duration'

import { Event } from './calendar'

dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isBetween)
dayjs.extend(Duration)

export function CreateFilterEventOngoing() {
  return (event: Event) => {
    const now = dayjs()
    const start = event.start.date ?? event.start.dateTime
    const end = event.end.date ?? event.end.dateTime
    return now.isBetween(start, end)
  }
}

export function CreateFilterEventStartsWithin(time: number, unit: Duration.DurationUnitType) {
  const duration = dayjs.duration(time, unit)
  return (event: Event) => {
    const start = dayjs(event.start.date ?? event.start.dateTime)
    const now = dayjs()
    return start.isBetween(now, now.add(duration))
  }
}

