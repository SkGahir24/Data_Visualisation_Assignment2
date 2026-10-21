// Map 2 — Vega-Lite dot map of recreation facilities across Victoria.
(async () => {
  try {
    const points = await councilMaps.facilities();
    const suburbOverlay = await councilMaps.suburbLines();
    const suburbNames = await councilMaps.suburbNameLayer();

    const layers = [
      councilMaps.backdrop(),
      ...(suburbOverlay ? [suburbOverlay] : []),
      councilMaps.councilLines(),
      {
        data: { values: points },
        mark: {
          type: 'circle',
          size: 25,
          color: '#d46e39',
          opacity: 0.65,
          stroke: '#fff',
          strokeWidth: 0.25
        },
        encoding: {
          longitude: { field: 'Longitude', type: 'quantitative' },
          latitude: { field: 'Latitude', type: 'quantitative' },
          tooltip: [
            { field: 'Facility Name', type: 'nominal', title: 'Facility' },
            { field: 'LGA Name', type: 'nominal', title: 'Council' }
          ]
        }
      },
      ...(suburbNames ? [suburbNames] : [])
    ];

    await councilMaps.draw(2, layers);
  } catch (error) {
    councilMaps.error(2, error);
  }
})();
