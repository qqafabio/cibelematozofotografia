#!/usr/bin/env bash
# ============================================================
# Backup diário do pb_data do PocketBase (CRM Cibele Matozo — v3.2)
# Instalado na VM Oracle em /opt/pocketbase/backup_pbdata.sh e disparado
# pelo cron (/etc/cron.d/pocketbase-backup). Mantém o PB (réplica de
# leitura) recuperável; o master de escrita continua sendo o Sheets.
# ============================================================
set -euo pipefail

PB_DIR=/opt/pocketbase
BK_DIR="$PB_DIR/backups"
RETENCAO_DIAS=14

mkdir -p "$BK_DIR"
STAMP=$(date +%F_%H%M%S)
ARQ="$BK_DIR/pb_data_$STAMP.tgz"

# tar do diretório inteiro do SQLite (inclui -wal/-shm). Para o volume e a
# taxa de escrita do CRM, um snapshot a quente é suficiente — e o Sheets
# segue como fonte da verdade caso precise reimportar.
tar czf "$ARQ" -C "$PB_DIR" pb_data

# Retenção: remove backups com mais de RETENCAO_DIAS dias.
find "$BK_DIR" -maxdepth 1 -name 'pb_data_*.tgz' -type f -mtime +"$RETENCAO_DIAS" -delete

echo "$(date '+%F %T') backup ok: $(basename "$ARQ") ($(du -h "$ARQ" | cut -f1))"
