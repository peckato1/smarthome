import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import * as model from 'client/golemio/model'
import * as client from 'client/golemio/client'
import { RouteBadge } from './Badges'
import LoadingSpinner from 'components/LoadingSpinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

dayjs.extend(relativeTime)

const pad2 = (n: number) => { return (n < 10 ? '0' : '') + n }
const delayed = (d: model.Departure) => {
  if (d.delay.is_available && d.delay.seconds && parseInt(d.delay.seconds!) > 0) {
    let secs = parseInt(d.delay.seconds)
    let dm = Math.floor(secs / 60)
    let ds = secs % 60

    return pad2(dm) + ':' + pad2(ds)
  }
  return undefined
}

function Error({ error }: { error?: any }) {
  if (!error)
    return null

  console.error(error)

  return (
    <div className="alert alert-danger" role="alert">
      {error.message}
    </div>
  )
}

function Infotexts({ data }: { data?: model.Infotext[] }) {
  if (!data || data.length === 0)
    return null

  return (
    <ul className="list-group">
      {data.map((text, i) => (
        <li key={i} className="list-group-item list-group-item-warning">
          <span className="fw-bold">{text.text}</span><br />
          <small>{ text.valid_from !== null && ( <span>Od: { text.valid_from }</span> ) }</small>
          <small>{ text.valid_to   !== null && ( <span>Do: { text.valid_to   }</span> ) }</small>
        </li>
        )
      )}
    </ul>
  )
}

function Departures({ departures }: { departures?: model.Departure[] }) {
  if (!departures)
    return null

  return (
    <>
      {departures.map(d => (
        <tr key={d.stop.id + "/" + d.trip.id}>
          <td className="font-monospace p-0 ps-1">
              {dayjs(d.departure_timestamp.scheduled).format('HH:mm')}
          </td>
          <td className="font-monospace p-0 ps-1">
              {delayed(d) && (<span className="ms-1 badge text-bg-warning">+&nbsp;{delayed(d)}</span>)}
          </td>
          <td className="p-0 ps-1">
            <small className="">{dayjs(d.departure_timestamp.predicted).fromNow()}</small>
          </td>
          <td className="p-0 ps-1">
            <div className="d-flex flex-row">
              <RouteBadge type={d.route.type} name={d.route.short_name} />
              <span className="fw-bold ms-2 flex-grow-1">{d.trip.headsign}</span>
              {d.trip.is_air_conditioned       && ( <div><FontAwesomeIcon className="mx-1" icon={solid("snowflake")} /></div> )}
              {d.trip.is_wheelchair_accessible && ( <div><FontAwesomeIcon className="mx-1" icon={solid("wheelchair")} /></div> )}
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

interface Filter {
  icon: React.ReactElement
  func: (d: model.Departure) => boolean
  active?: boolean
}

function FilterIcon({ icon, active, onClick }: { icon: React.ReactElement, active: boolean, onClick: any}) {
  const styles = active ? undefined : { opacity: "0.5" }

  // eslint-disable-next-line
  return ( <a role="button" className="p-0 ps-1" style={styles} onClick={onClick}> {icon} </a> )
}

interface HeaderRowProps {
  stopName: string
  filters: Filter[]
  activeFilters: number[]
  setActiveFilters: React.Dispatch<React.SetStateAction<number[]>>
  updated: number
}
function HeaderRow(props: HeaderRowProps) {
  const toggleActiveFilter = useCallback((filterIndex: number) => {
    props.setActiveFilters((prevState: number[]) => {
      if (!prevState.includes(filterIndex)) {
        return [...prevState, filterIndex]
      } else {
        return prevState.filter((e) => e !== filterIndex)
      }
    })
  }, [props])

  return (
    <tr className="table-primary">
      <td colSpan={4}>
        <div className="d-flex flex-row justify-content-between">
          <span className="fw-bold">{props.stopName}</span>
          <div className="btn-group" role="group" aria-label="Filters">
            { props.filters.map((filter, index) => (
                <FilterIcon key={index} icon={filter.icon} active={props.activeFilters.length === 0 || props.activeFilters.includes(index)} onClick={() => toggleActiveFilter(index)} />
            ))}
            { props.filters.length > 0 && (
              <button type="button" className="btn-close" aria-label="Clear filters" onClick={() => props.setActiveFilters(() => [])}></button>
            )}
          </div>
          <span className="text-muted"><small>{dayjs(props.updated).format('HH:mm:ss')}</small></span>
        </div>
      </td>
    </tr>
  )
}

function ConditionalRow({ visible, children } : { visible: boolean, children: React.ReactNode | React.ReactNode[] }) {
  if (!visible)
    return null

  return (
    <tr>
      <td colSpan={4}>
        {children}
      </td>
    </tr>
  )
}

interface PIDDepartureBoardProps {
  pidStopId: string
  count: number
  filters: Filter[]
}
export default function PIDDepartureBoard(props: PIDDepartureBoardProps) {
  const { data, isLoading, error, dataUpdatedAt } = useQuery(client.constructQuery('departureBoards', { stopName: props.pidStopId }))
  const [ activeFilters, setActiveFilters] = useState<number[]>(props.filters.filter(f => f.active === true).map((f, i) => i))

  const filterDepartures = useCallback((departures: model.Departure[]) => {
    if (activeFilters.length === 0) {
      return departures
    }
    return departures.filter(dept => activeFilters.some(filterIndex => props.filters[filterIndex].func(dept)))
  }, [props.filters, activeFilters])

  return (
    <tbody>
      <HeaderRow stopName={props.pidStopId} filters={props.filters} activeFilters={activeFilters} setActiveFilters={setActiveFilters} updated={dataUpdatedAt} />

      <ConditionalRow visible={error !== null}>
        <Error error={error} />
      </ConditionalRow>

      <ConditionalRow visible={isLoading === true}>
        <LoadingSpinner />
      </ConditionalRow>

      <ConditionalRow visible={data !== undefined && (data as any).infotexts.length > 0}>
        <Infotexts data={(data as any)?.infotexts} />
      </ConditionalRow>

      <Departures departures={data ? filterDepartures((data as any).departures as model.Departure[]).slice(0, props.count) : undefined} />
    </tbody>
  )
}
