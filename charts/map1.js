// Map 1: Proportional symbols showing recreation facilities by Victorian council.
// Each symbol is placed at a representative point inside its council.
(async () => {
  try {
    const suburbOverlay = await councilMaps.suburbLines();
    const suburbNames = await councilMaps.suburbNameLayer();

    const layers = [
      councilMaps.backdrop(),
      ...(suburbOverlay ? [suburbOverlay] : []),
      councilMaps.councilLines(),
      {
        data: { url: 'data/vic_council_symbols.json' },
        mark: {
          type: 'circle',
          opacity: 0.57,
          stroke: '#ffffff',
          strokeWidth: 0.65
        },
        encoding: {
          longitude: { field: 'Longitude', type: 'quantitative' },
          latitude: { field: 'Latitude', type: 'quantitative' },
          size: {
            field: 'Count',
            type: 'quantitative',
            title: 'Recreation facilities per council',
            scale: { type: 'sqrt', domainMin: 0, range: [15, 900] },
            legend: null
          },
          color: {
            field: 'Count',
            type: 'quantitative',
            title: 'Recreation facilities per council',
            legend: {
              orient: 'bottom',
              direction: 'horizontal',
              titleLimit: 450,
              titleFontSize: 16,
              labelFontSize: 13,
              gradientLength: 360
            },
            scale: { scheme: 'orangered', domainMin: 0 }
          },
          tooltip: [
            { field: 'Council', type: 'nominal', title: 'Council' },
            { field: 'Count', type: 'quantitative', title: 'Recreation facilities', format: ',d' }
          ]
        }
      },
      ...(suburbNames ? [suburbNames] : [])
    ];

    await councilMaps.draw(1, layers);
    const title = document.querySelector('#visualisation-1 .chart-type');
    if (title) title.textContent = 'Proportional symbol map';
  } catch (error) {
    councilMaps.error(1, error);
  }
})();
