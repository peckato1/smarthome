interface RouteBadgeProps {
	type: string
	name: string
}

export default function RouteBadge(props: RouteBadgeProps) {
  let imgSrc: string
  let bgColor: string

  const metroColor: { [key: string]: string } = {
    'A': '#1ca867',
    'B': '#f9b123',
    'C': '#d0043c'
  }

  switch (+props.type) {
  	case 0:
  	  imgSrc = 'tram.png'
  	  bgColor = '#7a0603'
  	  break
  	case 1:
  	  imgSrc = 'metro.png'
  	  bgColor = metroColor[props.name]
  	  break
  	case 3:
  	  imgSrc = 'bus.png'
  	  bgColor = '#007da8'
  	  break
  	default:
  	  imgSrc = ''
  	  bgColor = ''
  }

  return (
    <div>
      <div className="" style={{borderStyle: 'solid', borderWidth: '1px', borderColor: bgColor, backgroundColor: bgColor, borderRadius: "6px", width: "5em", height: "auto"}}>
        <img alt={imgSrc} src={"/smarthome/assets/img/" + imgSrc} style={{width: "24px"}} />
        <span className="mx-2 fw-bold" style={{color: 'white'}}>{props.name}</span>
      </div>
    </div>
  )
}


