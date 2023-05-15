import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const imageBounds: L.LatLngBoundsLiteral = [[51.889, 20.223], [47.09, 10.06]]
// const imageBoundsCzSk: L.LatLngBoundsLiteral  = [[51.879, 24.038], [45.917, 10.063]]

const ANIMATION_MS = 500

function constructDates(n: number): dayjs.Dayjs[] {
  const now = dayjs()
  const minutesTen = Math.floor(+now.format('mm')/ 10) * 10

  const firstDate = now.minute(minutesTen).second(0).millisecond(0)

  return Array(n - 1).fill(0).reduce((prev) => {
    const n = prev[0].subtract(10, 'minutes')
    return [n, ...prev]
   }, [firstDate])
}

interface ImageObject {
  link: string
  date: dayjs.Dayjs
}

function Images({ bounds, opacity, zIndex, images }: { bounds: L.LatLngBoundsLiteral, opacity: number, zIndex: number, images: ImageObject[] }) {
  const [n, setN] = useState<number>(0)

  useEffect(() => {
    const nextImage = () => {
      setN(() => (n + 1) % images.length)
    }
    const timer = setInterval(nextImage, ANIMATION_MS * (n === images.length - 1 ? 3 : 1))
    return () => clearInterval(timer)
  }, [images, n])

  if (images.length === 0) {
    return null
  }

  return (
    <React.Fragment>
    <ImageOverlay
      url={images[n].link}
      bounds={bounds}
      opacity={opacity}
      zIndex={zIndex}
    />
    <div className="position-relative">
      <div className="position-absolute top-20 end-0" style={{zIndex: 1000}}>
        <span className="fw-bold h1">{images[n].date.format('HH:mm')}</span>
      </div>
    </div>
    </React.Fragment>
  )
}

export default function WeatherRadar({ lat, lon } : { lat: number, lon: number }) {
  const [images, setImages] = useState<{link: string, date: dayjs.Dayjs}[]>([])

  useEffect(() => {
    const dates = constructDates(10)
    const imagesObjects = dates.map(date => { return {
      link: `https://radar.bourky.cz/data/pacz2gmaps.z_max3d.${date.utc().format('YYYYMMDD.HHmm')}.0.png`,
      date: date,
    }})
    setImages(() => imagesObjects)
  }, [])

  return (
    <MapContainer center={[lat, lon]} zoom={7} scrollWheelZoom={false} style={{height: "73vh", width: "100%"}}>
      <TileLayer
        attribution='&copy; <a href="http://www.mapy.cz">mapy.cz</a> by <a href="http://www.seznam.cz">Seznam.cz</a>, a.s.'
        url="http://mapserver.mapy.cz/turist-m/{z}-{x}-{y}"
      />
      <Images images={images} bounds={imageBounds} opacity={0.8} zIndex={10} />
    </MapContainer>
)
}