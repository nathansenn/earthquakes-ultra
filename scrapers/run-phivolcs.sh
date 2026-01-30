#!/bin/bash
# PHIVOLCS Scraper Runner
# Run: ./scrapers/run-phivolcs.sh

cd "$(dirname "$0")/.."

echo "[$(date)] Starting PHIVOLCS scraper..."

# Run the scraper
npx ts-node scrapers/phivolcs-scraper.ts

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date)] PHIVOLCS scraper completed successfully"
else
    echo "[$(date)] PHIVOLCS scraper failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
