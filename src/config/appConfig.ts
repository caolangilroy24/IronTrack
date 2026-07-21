export const APP_CONFIG = {
  displayName: "Láidir",
  backup: {
    userFilePrefix: "laidir_backup",
    allDataFileName: "irontrack-backup.json",
    validationLabel: "Laidir",
  },
} as const;

export const INVALID_BACKUP_JSON_MESSAGE = `Backup JSON is invalid or does not match the expected ${APP_CONFIG.backup.validationLabel} backup structure.`;
