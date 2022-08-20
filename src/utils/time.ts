import dayjs from 'dayjs'

export const formatRfc3339 = (date: dayjs.Dayjs) => date.format('YYYY-MM-DDTHH:mm:ssZ')
