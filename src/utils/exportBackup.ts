import { getLocalStoragePayload } from '@/storage/localStorage'

export function exportLocalStorageBackup(fileName = 'irontrack-backup.json'): string {
  const payload = getLocalStoragePayload()
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = fileName
  link.click()

  URL.revokeObjectURL(objectUrl)

  return json
}