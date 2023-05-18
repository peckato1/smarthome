import axios from 'axios'
import * as model from './model'

const client = axios.create({
    baseURL: 'https://api.golemio.cz/v2/',
    headers: {
        'x-access-token': process.env.REACT_APP_GOLEMIO_APIKEY!,
        'Content-Type': 'application/json; charset=utf-8'
    },
})

async function apicall<T>(url: string, params: any = {}): Promise<T> {
    const resp = await client.get<T>(url, params)
    return resp.data
}

export const QUERIES = {
    departureBoards: (params: { stopName: string }) => ({
        queryKey: ["departureBoard", params],
        queryFn: () => apicall<model.DepartureBoard>("pid/departureboards", { params: {
            names: params.stopName,
        }})
    }),
    alerts: () => ({
        queryKey: ["alerts"],
        queryFn: () => apicall<model.GtfsRealtime<model.Alert[]>>("vehiclepositions/gtfsrt/alerts.json")
    }),
    routes: () => ({
        queryKey: ["routes"],
        queryFn: () => apicall<model.GTFSRoute[]>("/gtfs/routes")
    }),
}

export function constructQuery(name: string, queryParams: any = {}, reactQueryParams: any = {}) {
    const queryConstructor = QUERIES[name as keyof typeof QUERIES]
    const q = queryConstructor(queryParams)
    return { ...q, ...reactQueryParams }
}
