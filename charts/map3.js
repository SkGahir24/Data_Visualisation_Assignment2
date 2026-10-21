// Map 3: Hexagonal hotspots showing recreation facility counts across Victoria.
(async () => {
  try {
    const suburbOverlay = await councilMaps.suburbLines();
    const suburbNames = await councilMaps.suburbNameLayer();

    const layers = [
      councilMaps.backdrop(),
      ...(suburbOverlay ? [suburbOverlay] : []),
      councilMaps.councilLines(),
      {
        data: {
          url: 'data/vic_hexes.geojson',
          format: { type: 'json', property: 'features' }
        },
        mark: {
          type: 'geoshape',
          stroke: '#ffffff',
          strokeWidth: 0.7,
          opacity: 0.94
        },
        encoding: {
          color: {
            field: 'properties.Count',
            type: 'quantitative',
            title: 'Recreation facilities per hexagon',
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
              titleLimit: 450,
              titleFontSize: 16,
              labelFontSize: 13,
              gradientLength: 360
            },
            scale: { scheme: 'yelloworangered', domainMin: 0 }
          },
          tooltip: [
            { field: 'properties.Area', type: 'nominal', title: 'Approximate area' },
            { field: 'properties.Count', type: 'quantitative', title: 'Facilities in hexagon' },
            { field: 'properties.FacilityNames', type: 'nominal', title: 'Facility names (sample)' },
            { field: 'properties.FacilityTypes', type: 'nominal', title: 'Facility types' }
          ]
        }
      },
      ...(suburbNames ? [suburbNames] : [])
    ];

    await councilMaps.draw(3, layers);
  } catch (error) {
    councilMaps.error(3, error);
  }
})();
