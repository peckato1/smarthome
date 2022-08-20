import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { formatRfc3339 as rfc3339 } from 'utils/time'
import { useGoogleApiContext } from 'hooks/GoogleApiContext'

const REFRESH_CALENDARS_INTERVAL_MS = 5 * 60 * 1000
const REFRESH_EVENTS_INTERVAL_MS = 5 * 60 * 1000

interface EventTime {
  date?: string
  dateTime?: string
  timeZone?: string
}

export interface Event {
  id: string
  iCalUID: string
  kind: "calendar#event"

  etag: string

  summary: string
  description: string

  created: string
  updated: string

  creator: { email?: string, displayName?: string, id?: string, self?: boolean }
  organizer: { email?: string, displayName?: string, id?: string, self?: boolean }

  location?: string

  start: EventTime
  end: EventTime

  status: string
  htmlLink: string
  reminders: { useDefault: true }

  eventType: "default" | "outOfOffice" | "focusTime"

  recurringEventId: string
  sequence: number
}

interface EventWithCalendar extends Event {
  calendarId: string
}

interface Calendar {
  id: string

  summary: string
  summaryOverride?: string

  backgroundColor?: string
  foregroundColor?: string

  etag: string
  hidden?: boolean

  primary?: boolean
  deleted?: boolean
  selected?: boolean
}

function calculateEventTime(start: EventTime, end: EventTime) {
  const isSameDay = (a: dayjs.Dayjs, b: dayjs.Dayjs) => a.format('YYYY-MM-DD') === b.format('YYYY-MM-DD')

  let text: string = ''

  if (start.dateTime) {
    const a = dayjs(start.dateTime)
    const b = dayjs(end.dateTime)

    if (isSameDay(a, b)) {
      text = a.format('dddd DD. MM.').concat(' ').concat(`${a.format('HH:mm')} - ${b.format('HH:mm')}`)
    } else {
      text = a.format('dddd DD. MM. HH:mm').concat(' - ').concat(b.format('dddd DD.MM. HH:mm'))
    }

  } else {
    const a = dayjs(start.date)
    const b = dayjs(end.date)

    text = a.format('dddd DD. MM.')
    if (!a.isSame(b.subtract(1, 'day'))) {
      text = text.concat(' - ').concat(b.subtract(1, 'second').format('dddd DD. MM.'))
    }
  }

  return { timeText: text, fromNow: dayjs(start.dateTime ? start.dateTime : start.date).fromNow() }
}

function EventDisplay({ event, compact }: { event: Event, compact: boolean }) {
  const { timeText, fromNow } = calculateEventTime(event.start, event.end)
  const eventStart = dayjs(event.start.date ?? event.start.dateTime)
  const now = dayjs()

  let itemClass: string = ''

  if (eventStart.isBefore(now)) {
    itemClass = "list-group-item-danger"
  } else if (eventStart.isBefore(now.add(3, 'days'))) {
    itemClass = "list-group-item-warning"
  } else if (eventStart.isBefore(now.add(7, 'days'))) {
    itemClass = "list-group-item-info"
  }

  return (
    <li className={"list-group-item p-1 " + itemClass}>
      <div className="ms-2 me-auto">
       <div className="d-flex w-100 justify-content-between">
          <h3 className="h6">
            <span className="fw-bold">{event.summary}</span> <small><span className="fw-bold text-primary">{timeText}</span></small>
          </h3>
          <small>{fromNow}</small>
        </div>
        {compact !== true && (
          <React.Fragment>
            {event.description && event.description.trim().length > 0 && (
              <p className="mb-0">
                <FontAwesomeIcon icon={solid("comment")} /> <span dangerouslySetInnerHTML={{ __html: event.description}} />
              </p>
            )}
            {event.location && (
              <p className="mb-0">
                <small>
                  <FontAwesomeIcon icon={solid("map-location")} /> <span className="text-muted">{event.location}</span>
                </small>
              </p>
            )}
          </React.Fragment>
        )}
      </div>
    </li>
  )
}

function EventList({ events, compact = false }: { events: EventWithCalendar[], compact?: boolean }) {
  return (
    <ul className="list-group">
      { events.map(e => (
        <EventDisplay key={e.id} event={e} compact={compact} />
      ))}
    </ul>
  )

}

interface CalendarSpecification {
  name?: string
  id?: string
}
interface CalendarProps {
  n?: number
  nIfFilteredEmpty?: number
  filter?: (event: EventWithCalendar) => boolean
  ignoredCalendars?: CalendarSpecification[]
}

function useCalendarEvents({ filter, n, nIfFilteredEmpty, ignoredCalendars = [] }: CalendarProps) {
  const googleApi = useGoogleApiContext()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [events, setEvents] = useState<{[key: string]: EventWithCalendar[]}>({})

  useEffect(() => {
  console.log(googleApi)
    const getData = () => {
      const { ready, fetchData } = googleApi
      if (!ready)
        return

      fetchData(`https://www.googleapis.com/calendar/v3/users/me/calendarList`)
        .then((resp) => {
          const calendars = resp.data.items.filter((calendar: Calendar) => !ignoredCalendars.some(spec => (spec.id && spec.id === calendar.id) || (spec.name && spec.name === calendar.summary)))
          setCalendars(() => calendars)
        }).catch((error) => {
          console.error(error)
        })
    }

    const interval = setInterval(getData, REFRESH_CALENDARS_INTERVAL_MS)
    getData()
    return () => clearInterval(interval)
  }, [ignoredCalendars, googleApi]);

  useEffect(() => {
    const getData = () => {
      const { ready, fetchData } = googleApi
      if (!ready)
        return

      const today = dayjs().startOf('date')
      const timeMin = rfc3339(today)
      const timeMax = rfc3339(today.add(3, 'month'))

      calendars.forEach(calendar => {
        fetchData(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events`, { params: {
            singleEvents: 'True',
            orderBy: 'startTime',
            timeMin: timeMin,
            timeMax: timeMax,
            maxResults: 40,
          }
        }).then(resp => {
          const extendedEvents = resp.data.items.map((event: Event): EventWithCalendar => {
            return { ...event, calendarId: calendar.id }
          })
          setEvents((prevState: any) => {
            let copy = { ...prevState }
            copy[calendar.id] = extendedEvents
            return copy
          })
        }).catch(error => {
          console.error(error)
        })
      })
    }

    const interval = setInterval(getData, REFRESH_EVENTS_INTERVAL_MS)
    getData()
    return () => clearInterval(interval)
  }, [calendars, googleApi]);

  const flattenedEvents = calendars.reduce((prev: EventWithCalendar[], calendar: Calendar) => {
    return (calendar.id in events) ? prev.concat(events[calendar.id]) : prev
  }, [])
  let filteredEvents = filter ? flattenedEvents.filter(filter) : flattenedEvents
  if (filteredEvents.length === 0) {
      filteredEvents = flattenedEvents.slice(0, nIfFilteredEmpty)
  } else {
      filteredEvents = filteredEvents.slice(0, n)
  }

  const displayedEvents = filteredEvents.sort((a: Event, b: Event) => {
    const startA = a.start.date ?? a.start.dateTime
    const startB = b.start.date ?? b.start.dateTime
    return dayjs(startA).valueOf() - dayjs(startB).valueOf()
  })

  return { calendars: calendars, events: displayedEvents }
}

export default function CalendarWrapper({ n, nIfFilteredEmpty, filter, ignoredCalendars }: CalendarProps) {
  const [currentCalendars, setCurrentCalendars] = useState<Calendar[]>([])
  const { calendars, events } = useCalendarEvents({
    filter: event => currentCalendars.some(c => c.id === event.calendarId) && (filter ? filter(event) : true),
    n: n,
    nIfFilteredEmpty: nIfFilteredEmpty,
    ignoredCalendars: ignoredCalendars,
  })

  const toggleCalendar = (calendar: Calendar) => {
    setCurrentCalendars((prevState: Calendar[]) => {
      if (!prevState.some(cc => cc.id === calendar.id)) {
        return [...prevState, calendar]
      } else {
        return prevState.filter(cc => cc.id !== calendar.id)
      }
    })
  }

  return (
    <React.Fragment>
      {calendars.length > 1 && (
        <div className="row mb-1 d-grid">
          <div className="btn-group" role="group">
            {calendars.filter(cal => cal.selected ?? false).map(cal => (
              <button
                type="button"
                key={cal.id}
                className={"btn btn-sm btn-primary" + (currentCalendars.some(cc => cc.id === cal.id) ? " active" : "")}
                onClick={() => toggleCalendar(cal)}>
                  {cal.summaryOverride ?? cal.summary}
              </button>
            ))}
          </div>
        </div>
      )}
      <EventList events={events} />
    </React.Fragment>
  )
}

export function CalendarCompact({ n, nIfFilteredEmpty, filter, ignoredCalendars }: CalendarProps) {
  const { events } = useCalendarEvents({
    filter: filter,
    n: n,
    nIfFilteredEmpty: nIfFilteredEmpty,
    ignoredCalendars: ignoredCalendars,
  })

  return (
    <EventList events={events} compact />
  )
}
