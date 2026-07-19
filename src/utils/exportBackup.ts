import {
  getLocalStoragePayload,
  getLocalUserStoragePayload,
} from '@/storage/localStorage'

export function buildBackupFileName(now = new Date()): string {
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')

  return `laidir_backup_${year}${month}${day}.json`
}

export function downloadJsonFile(json: string, fileName: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = fileName
  link.click()

  URL.revokeObjectURL(objectUrl)
}

export function exportLocalUserStorageBackup(
  userId?: string,
  now = new Date(),
): string {
  const payload = getLocalUserStoragePayload(userId)
  const json = JSON.stringify(payload, null, 2)

  downloadJsonFile(json, buildBackupFileName(now))

  return json
}

export function exportLocalStorageBackup(fileName = 'irontrack-backup.json'): string {
  const payload = getLocalStoragePayload()
  const json = JSON.stringify(payload, null, 2)
  downloadJsonFile(json, fileName)

  return json
}