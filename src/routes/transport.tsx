import PIDDepartureBoard from 'components/transport/pid/DepartureBoard'
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
  return (
    <table className="table table-sm table-striped table-bordered">
      {boards.map(e => (
        <PIDDepartureBoard key={e.name} pidStopId={e.name} count={e.count} filters={e.filters} />
      ))}
    </table>
  )
}
