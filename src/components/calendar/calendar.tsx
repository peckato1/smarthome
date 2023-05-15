import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { formatRfc3339 as rfc3339 } from 'utils/time'
import { useGoogleApiContext } from 'hooks/GoogleApiContext'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

interface EventTime {
  date?: string
  dateTime?: string
  timeZone?: string
}

interface Event {
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
/*
  return (
    <React.Fragment>
      <span className="fw-bold text-primary">{text}</span> <span className="text-muted">({})</span>
    </React.Fragment>
  )
*/
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
    <li className={"list-group-item " + itemClass}>
      <div className="ms-2 me-auto">
       <div className="d-flex w-100 justify-content-between">
          <h3 className="h6">
            <span className="fw-bold">{event.summary}</span> <small><span className="fw-bold text-primary">{timeText}</span></small>
          </h3>
          <small>{fromNow}</small>
        </div>
        {compact !== true && (
          <React.Fragment>
            {event.description && (
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

function Calendar({ events, compact }: { events: Event[], compact: boolean }) {
  return (
    <ul className="list-group">
      {events.map((e: any) => (
          <EventDisplay key={e.id} event={e} compact={compact} />
      ))}
    </ul>
  )
}

interface CalendarProps {
  calendars: { id: string, name: string }[]
  n?: number
  compact?: boolean
  datefilter?: (eventStart: dayjs.Dayjs, eventEnd: dayjs.Dayjs) => boolean
}

const dummyDateFilter = (eventStart: dayjs.Dayjs, eventEnd: dayjs.Dayjs) => true

export default function CalendarWrapper({ calendars, n = 10, compact = false, datefilter = dummyDateFilter }: CalendarProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [currentCal, setCurrentCal] = useState<number>(0)
  const googleApi = useGoogleApiContext()

  useEffect(() => {
    const getData = () => {
      const { ready, fetchData } = googleApi
      if (!ready) {
        return
      }

      const today = dayjs().startOf('date')

      fetchData(`https://www.googleapis.com/calendar/v3/calendars/${calendars[currentCal].id}/events`, { params: {
          singleEvents: 'True',
          orderBy: 'startTime',
          timeMin: rfc3339(today),
          timeMax: rfc3339(today.add(3, 'month')),
          maxResults: n,
        }
      }).then((resp) => {
        setEvents(() => resp.data.items)
      }).catch((error) => {
        console.error(error)
      })
    }

    const interval = setInterval(getData, REFRESH_INTERVAL_MS)
    getData()

    return () => {
      clearInterval(interval);
    };
  }, [googleApi, currentCal, calendars, n]);


  let selectedEvents = events.filter(event => datefilter(dayjs(event.start.dateTime ?? event.start.date), dayjs(event.end.dateTime ?? event.end.date)))
  if (selectedEvents.length === 0) {
      selectedEvents = events
  }

  return (
    <div className="container-fluid">
      {calendars.length > 1 && (
        <div className="row mb-1 d-flex flex-row">
          <div className="btn-group" role="group">
            {calendars.map((cal, id) => (
              <button
                key={cal.id}
                className={"btn btn-sm btn-primary " + (currentCal === id ? "active" : "")}
                type="button"
                onClick={() => setCurrentCal(() => id)}>
                  {cal.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="row">
        <Calendar
          events={selectedEvents}
          compact={compact}
        />
      </div>
    </div>
  )
}
