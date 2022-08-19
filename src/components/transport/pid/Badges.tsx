import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

function Badge({ type, subtype, element }: { type: string, subtype?: string, element?: React.ReactElement}) {
  let bgColor: string

  const metroColor: { [key: string]: string } = {
    'A': '#1ca867',
    'B': '#f9b123',
    'C': '#d0043c'
  }

  switch (type) {
  	case 'tram':
  	  bgColor = '#7a0603'
  	  break
  	case 'metro':
  	  bgColor = metroColor[subtype ?? 'A']
  	  break
  	case 'bus':
  	  bgColor = '#007da8'
  	  break
  	default:
  	  bgColor = ''
  }

  return (
    <div>
      <div className="" style={{borderStyle: 'solid', borderWidth: '1px', borderColor: bgColor, backgroundColor: bgColor, borderRadius: "6px", width: "5em", height: "auto"}}>
        <img alt={type} src={`/smarthome/assets/img/${type}.png`} style={{width: "24px"}} />
        { element && (
          <span className="mx-2 fw-bold" style={{color: 'white'}}>{element}</span>
        )}
      </div>
    </div>
  )
}

export function RouteBadge({ type, name }: { type: string, name: string }) {
  const idToType: { [key: string]: string } = {
    '0': 'tram',
    '1': 'metro',
    '3': 'bus',
  }

  return ( <Badge type={idToType[type]} subtype={type === 'metro' ? name : undefined} element={( <span>{name}</span> )} /> )
}


export function FilterBadge({ type, direction }: { type: string, direction?: "up" | "down" }) {
  const icon = direction !== undefined ? ( <FontAwesomeIcon icon={direction === 'up' ? solid('arrow-up') : solid('arrow-down')} />) : undefined

  return ( <Badge type={type} element={icon ?? undefined} /> )
}

