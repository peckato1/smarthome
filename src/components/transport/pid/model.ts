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

export interface Route {
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

export interface Departure {
    arrival_timestamp: DepartureTimestamp
    departure_timestamp: DepartureTimestamp
    delay: Delay
    last_stop: LastStop
    route: Route
    stop: Stop
    trip: Trip
}
