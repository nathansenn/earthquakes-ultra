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
    
    # Push updates to GitHub for Railway deployment
    if [ -n "$(git status --porcelain data/)" ]; then
        echo "[$(date)] Pushing database updates to GitHub..."
        git add data/earthquakes.db
        git commit -m "chore: update earthquake data $(date +%Y-%m-%d_%H:%M)"
        git push origin main
        echo "[$(date)] Pushed to GitHub successfully"
    else
        echo "[$(date)] No data changes to push"
    fi
else
    echo "[$(date)] PHIVOLCS scraper failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
