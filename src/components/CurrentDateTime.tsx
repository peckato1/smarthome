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
    <div className="container-fluid">
      <p className="display-6 text-center fw-bold mb-0">{date.format('ddd D. MMMM YYYY HH:mm:ss')}</p>
    </div>
  )
}


