# Lindol.ph — Real-Time Global Earthquake Monitoring

🌍 **Every Tremor. Everywhere.**

Lindol.ph is a real-time earthquake monitoring platform focused on the Philippines, with global coverage. "Lindol" is Filipino for "earthquake."

## Features

- 📊 **M1+ Earthquake Data** - Track ALL earthquakes including micro-earthquakes (most sites only show M4+)
- 🇵🇭 **Philippines Focus** - Detailed coverage for 150+ cities and 17 regions
- ⚡ **Real-Time Updates** - Data refreshed every minute from USGS
- 🗺️ **Interactive Maps** - 2D map and 3D globe visualization
- 🌋 **Volcano Monitoring** - Track seismic-volcanic correlations for Philippine volcanoes
- 📍 **Near Me** - Find earthquakes near your location
- 🔔 **Custom Alerts** - Set up earthquake notifications
- 📚 **Safety Resources** - Earthquake preparedness guides

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4
- **3D Globe:** Three.js, React Three Fiber, globe.gl
- **Data Source:** USGS Earthquake API
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Pages

- `/` - Homepage with global stats and recent earthquakes
- `/earthquakes` - All earthquakes (M1+) with filters
- `/philippines` - Browse by city and region
- `/philippines/[city]` - City-specific earthquake data
- `/region/[region]` - Regional earthquake data
- `/map` - Interactive 2D map
- `/globe` - 3D globe visualization
- `/volcanoes` - Philippine volcano monitoring
- `/near-me` - Earthquakes near your location
- `/alerts` - Set up earthquake alerts
- `/preparedness` - Earthquake safety guide

## Data Sources

- **USGS Earthquake Hazards Program** - https://earthquake.usgs.gov/
- **PHIVOLCS** - Philippine Institute of Volcanology and Seismology

## Emergency Contacts (Philippines)

- **National Emergency:** 911
- **Red Cross:** 143
- **NDRRMC:** (02) 8911-5061
- **PHIVOLCS:** (02) 8426-1468

## License

This project is for educational and public safety purposes.

---

*Stay informed. Stay prepared. Stay safe.*
# Health endpoint fix - 1769739863
