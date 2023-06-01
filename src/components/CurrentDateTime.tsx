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

  return <span className="fs-5 fw-bold">{date.format('dddd, D. M.  HH:mm:ss')}</span>
}
