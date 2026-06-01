#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/speakeasy"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/speakeasy_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "Starting PostgreSQL backup for SpeakEasy database..."

# Run backup dump and compress on the fly
# DATABASE_URL is fetched from environment variable
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL variable is not set."
    exit 1
fi

pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully! Saved to: ${BACKUP_FILE}"
else
    echo "ERROR: Database backup dump failed."
    exit 1
fi

# Purge backup files older than retention policy
echo "Enforcing backup retention policy (deleting files older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "speakeasy_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm {} \;

echo "Backup maintenance finished."
