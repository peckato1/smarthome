import React, { useState, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

import { MapContainer, TileLayer, ImageOverlay } from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const imageBounds: L.LatLngBoundsLiteral = [[51.889, 20.223], [47.09, 10.06]]
// const imageBoundsCzSk: L.LatLngBoundsLiteral  = [[51.879, 24.038], [45.917, 10.063]]

const ANIMATION_MS = 350
const REFRESH_IMAGES_MS = 30 * 1000

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
  const [animate, setAnimate] = useState<boolean>(true)

  useEffect(() => {
    const nextImage = () => {
      if (animate) {
	    setN(() => (n + 1) % images.length)
	  }
    }
    const timer = setInterval(nextImage, ANIMATION_MS * (n === images.length - 1 ? 3 : 1))
    return () => clearInterval(timer)
  }, [images, n, animate])

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
        <ul className="list-group">
          { images.map((e, index) => (
            <button key={index} className={"list-group-item list-group-item-action p-0 px-1 pb-1" + (n === index ? " list-group-item-success" : "" )} onClick={() => { setN(() => index); setAnimate(() => false) }}>
              <span className="fw-bold">{e.date.format('HH:mm')}</span>
            </button>
          ))}
          <button className="list-group-item list-group-item-action p-0 px-1 pb-1 text-center" onClick={() => setAnimate((prevState: boolean) => !prevState)}>
            <FontAwesomeIcon icon={animate ? solid("pause") : solid("play")} />
          </button>
        </ul>
      </div>
    </div>
    </React.Fragment>
  )
}

const compareImageObjectArray = (a: ImageObject[], b: ImageObject[]) => {
  return a.length === b.length && a.every((e, index) => e.date.isSame(b[index].date))
}

export default function WeatherRadar({ lat, lon } : { lat: number, lon: number }) {
  const [images, setImages] = useState<ImageObject[]>([])

  useEffect(() => {
    const fetchImages = () => {
      const dates = constructDates(10)
      const imageObjects = dates.map(date => { return {
        link: `https://radar.bourky.cz/data/pacz2gmaps.z_max3d.${date.utc().format('YYYYMMDD.HHmm')}.0.png`,
        date: date,
      }})

      setImages((prevState: ImageObject[]) => compareImageObjectArray(prevState, imageObjects) ? prevState : imageObjects)
    }

    const timer = setInterval(fetchImages, REFRESH_IMAGES_MS)
    fetchImages()
    return () => clearInterval(timer)
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
