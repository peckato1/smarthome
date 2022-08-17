import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'

dayjs.extend(relativeTime)
dayjs.extend(isToday)

export const formatRfc3339 = (date: dayjs.Dayjs) => date.format('YYYY-MM-DDTHH:mm:ssZ')

export const todayEvent = (eventStart: dayjs.Dayjs, eventEnd: dayjs.Dayjs) => {
  const today = dayjs().startOf('day')
  const todayEnd = dayjs().startOf('day').add(1, 'day')

  return eventStart.isToday() || eventEnd.isToday() || (eventStart.isBefore(today) && eventEnd.isAfter(todayEnd))
}
