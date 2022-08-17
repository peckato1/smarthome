export function setStorage(key: string, value: any) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getStorage(key: string) {
  const storageData = window.localStorage.getItem(key)
  return storageData ? JSON.parse(storageData) : undefined
}
