export interface GTFSRoute {
    agency_id: string
    is_night: boolean
    is_regional: boolean
    is_substitute_transport: boolean
    route_color: string
    route_desc: string
    route_id: string
    route_long_name: string
    route_short_name: string
    route_text_color: string
    route_type: string
    route_url: string
}

export interface Infotext {
    valid_from: string | null
    valid_to: string | null
    text: string
    text_en: string | null
    display_type: "inline" | "general" | "general-alternate"
}

export interface DepartureTimestamp {
    predicted: string | null
    scheduled: string
    minutes: string
}

export interface Delay {
    is_available: boolean
    minutes?: string
    seconds?: string
}

export interface LastStop {
    name: string
    id: string
}

export interface RouteDeptBoard {
    short_name: string
    type: string
    is_night: boolean
    is_regional: boolean
    is_substitute_transport: boolean
}

export interface Stop {
    id: string
    platform_code: string
}

export interface Trip {
    direction: string
    headsign: string
    id: string
    is_at_stop: string
    is_canceled: string
    is_wheelchair_accessible: string
    is_air_conditioned: string
    short_name: string
}

export interface DepartureBoard {
    stops: Stop[]
    departures: Departure[]
}

export interface Departure {
    arrival_timestamp: DepartureTimestamp
    departure_timestamp: DepartureTimestamp
    delay: Delay
    last_stop: LastStop
    route: RouteDeptBoard
    stop: Stop
    trip: Trip
}

export interface Alert {
    id: string
    alert: AlertDetail
}

interface TranslationText {
    lang: string
    text: string
}

interface Translation {
    translation: TranslationText[]
}

interface InformedEntity {
    routeId: string
}

interface AlertDetail {
    activePeriod: { start: string, end: string }[]
    cause: string
    effect: string
    descriptionText: Translation
    headerText: Translation
    informedEntity: InformedEntity[]
    url: Translation
}

interface GtfsRealtimeHeader {
    gtfsRealtimeVersion: string
    incrementality: string
    timestamp: string
}

export interface GtfsRealtime<T> {
    entity: T[]
    header: GtfsRealtimeHeader
}
