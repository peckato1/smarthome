import PIDDepartureBoard from 'components/transport/pid/DepartureBoard'
import { useQuery } from '@tanstack/react-query'
import * as client from 'client/golemio/client'
import * as model from 'client/golemio/model'
import { FilterBadge } from 'components/transport/pid/Badges'

const boards = [
  { name: "Sídliště Červený Vrch", count: 6, filters: [
    { icon: <FilterBadge type="tram"  direction="down" />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'A', active: true},
    { icon: <FilterBadge type="tram"  direction="up"   />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'B'},
  ]},
  { name: "Bořislavka", count: 6, filters: [
    { icon: <FilterBadge type="metro" direction="down" />, func: (d: model.Departure) => +d.route.type === 1 && d.stop.platform_code === '1', active: true},
    { icon: <FilterBadge type="tram"  direction="down" />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'A', active: true},
    { icon: <FilterBadge type="bus"                    />, func: (d: model.Departure) => +d.route.type === 3},
    { icon: <FilterBadge type="metro" direction="up"   />, func: (d: model.Departure) => +d.route.type === 1 && d.stop.platform_code === '2'},
    { icon: <FilterBadge type="tram"  direction="up"   />, func: (d: model.Departure) => +d.route.type === 0 && d.stop.platform_code === 'B'},
  ]},
  { name: "Nádraží Veleslavín", count: 7, filters: [] },
]

export default function TransportRoute() {
  const { data: alertsData } = useQuery<model.GtfsRealtime<model.Alert>>(client.constructQuery('alerts'))
  const { data: routesData } = useQuery<model.GTFSRoute[]>(client.constructQuery('routes'), {} as any, { staleTime: 1 * 60 * 60 * 1000 })

  const routesByShortName = routesData ? routesData.reduce((p, c) => ({ ...p, [c.route_short_name]: c}), {}) : []

  return (
    <table className="table table-sm table-striped table-bordered">
      {boards.map(e => (
        <PIDDepartureBoard key={e.name} pidStopId={e.name} count={e.count} filters={e.filters} routes={routesByShortName} alerts={alertsData ? alertsData.entity : []} />
      ))}
    </table>
  )
}
