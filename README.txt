VICTORIAN COUNCIL SERVICES — READABLE SOURCE CODE

HOW TO RUN
1. Open this entire folder in VS Code.
2. Open index.html with the Live Server extension.
3. Keep the data folder beside index.html.
4. An internet connection is needed for Leaflet, H3, Vega and the map tiles.

WHERE THE CODE IS
- index.html: page headings, cards, explanations, and links to scripts.
- styles.css: website colours, fonts, spacing, and layout.
- site.js: search and category filter buttons.
- maps.js: the three geographic maps (choropleth, dots, hexagons).
- charts/common.js: small shared functions for loading data and showing charts.
- charts/chart4.js: library visits heatmap.
- charts/chart5.js: waste collection area chart.
- charts/chart6.js: interactive council spider/radar chart.
- charts/chart7.js: connected dot plot of library costs.
- charts/chart8.js: membership vs visits scatter plot with trend line.
- charts/chart9.js: financial position stacked bars.
- charts/chart10.js: consultation satisfaction annual heatmap.
- data/: the unchanged JSON datasets used by the website.

Each chart is in its own file, uses simple variable names, and includes
short comments explaining what it does. Each chart loads separately.

NOTES
- The map code still uses Leaflet and H3, which have some necessary
  specialist functions.
- The choropleth still requires valid council GeoJSON boundaries.
  For reliable local loading, add data/victoria_lga.geojson.
- This is a readability refactor. The chart data and intended chart
  designs have been kept, but full browser rendering has not been verified.


VEGA-LITE MAPS UPDATE
Maps 1, 2 and 3 are now Vega-Lite maps, each in its own JavaScript file.
Map 1: charts/map1.js (choropleth). Requires data/victoria_lga.geojson with
actual Victorian local-government-area polygons and a council-name property
such as LGA_NAME. This GeoJSON was not included in the original project and
must be supplied from an authoritative geographic dataset. Do not substitute
facility points for polygons.
Map 2: charts/map2.js (dot map). Uses data/facilities.json.
Map 3: charts/map3.js (hexbin map). Uses H3 to generate hexagons and Vega-Lite
to display them. Requires the H3 CDN library to be accessible.
The original Leaflet maps.js file is no longer referenced by index.html.
Upload all the files at repository root, preserving the charts/ and data/ folders.

MAP FIX (Charts 1-3)
All three maps use Vega-Lite. The maps first look for data/victoria_lga.geojson.
If it is absent, they request real Victorian council polygons from the CFA
Victorian Government ArcGIS GeoJSON service. For reliable offline hosting,
download the council GeoJSON from the official service and save it as
  data/victoria_lga.geojson
Source: https://maps.cfa.vic.gov.au/arcgis/rest/services/MOLViewer/MOLi_BaseBdy/MapServer/16
If the official server blocks cross-origin browser requests, downloading
that file locally is necessary. No council polygons are invented.


================================================
DATA SOURCES AND METHODOLOGY
================================================
DATA & METHODOLOGY (TECHNICAL NOTES)

Maps 1–3: data/facilities.json; data/vic_council_symbols.json; data/vic_hexes.geojson; data/victoria_lga.geojson. 4,676 facility records, 87 council symbols, 334 populated hexagons. Geographic counts are derived from facility coordinates; suburb outlines load separately online.
Charts 4, 6–8 and 10: data/performance.json. Local Government Performance Reporting Framework, 2020–21 through 2024–25; indicators include LB8, LB5, LB7, WC5, AF6, G2. Some charts show selected councils.
Chart 5: data/waste.json. Garbage collected in tonnes, financial years 2001–02 to 2023–24. Year-to-year council coverage may vary.
Chart 9: data/finance.json. Financial position: assets and liabilities, not service spending.

Sources: original publisher URLs, authors and access dates are not present in bundled JSON files. Add verified source citations from the original dataset download records before submission.

RUNNING THE WEBSITE
Open index.html using VS Code Live Server. Keep the data/ and charts/ folders together; an internet connection is required for Vega libraries and online suburb boundaries.
