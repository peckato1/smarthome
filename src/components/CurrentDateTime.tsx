import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export default function CurrentDateTime() {
  const [today, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1 /* s */ * 1000 /* ms in s */);

    return () => {
      clearInterval(timer); // Return a function to clear the timer so that it will stop being called on unmount
    }
  }, []);

  let date = dayjs(today)

  return (
    <div className="container-fluid d-flex flex-row justify-content-between">
      <span className="display-6 fw-bold">{date.format('HH:mm:ss')}</span>
      <span className="display-6 fw-bold">{date.format('dddd D. MMMM')}</span>
    </div>
  )
}


