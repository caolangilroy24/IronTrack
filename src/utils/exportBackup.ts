import {
  getLocalStoragePayload,
  getLocalUserStoragePayload,
} from '@/storage/localStorage'
import { APP_CONFIG } from '@/config/appConfig'

export function buildBackupFileName(now = new Date()): string {
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')

  return `${APP_CONFIG.backup.userFilePrefix}_${year}${month}${day}.json`
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
  // Launch V1: Add an optional passphrase-protected export mode before broadening access beyond trusted whitelist testers.
  const payload = getLocalUserStoragePayload(userId)
  const json = JSON.stringify(payload, null, 2)

  downloadJsonFile(json, buildBackupFileName(now))

  return json
}

export function exportLocalStorageBackup(
  fileName = APP_CONFIG.backup.allDataFileName,
): string {
  const payload = getLocalStoragePayload()
  const json = JSON.stringify(payload, null, 2)
  downloadJsonFile(json, fileName)

  return json
}