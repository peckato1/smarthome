export function WeatherIcon({ icon }: { icon: string }) {
  return ( <i className={["wi", icon].join(" ")}></i> )
}
