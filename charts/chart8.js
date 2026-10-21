// Chart 8: Council-level choropleth using the same local Victoria polygons as Maps 1–3.
(async function drawChart8() {
  try {
    const performance = await councilCharts.readData('performance');
    const response = await fetch('data/victoria_lga.geojson');
    if (!response.ok) throw new Error('Victorian council boundaries could not be loaded');
    const geojson = await response.json();
    if (!Array.isArray(geojson.features)) throw new Error('Invalid council boundary data');

    const normalise = value => String(value || '')
      .replace(/^Borough of /i, '').replace(/\s+(Rural City|City|Shire)$/i, '')
      .trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const byCouncil = new Map();
    for (const row of performance) {
      if (row.Year !== councilCharts.year || (row.ID !== 'LB7' && row.ID !== 'LB8')) continue;
      const value = Number(row.Result);
      if (!Number.isFinite(value)) continue;
      const key = normalise(row.Council);
      if (!byCouncil.has(key)) byCouncil.set(key, {});
      byCouncil.get(key)[row.ID === 'LB7' ? 'Membership' : 'Visits'] = value;
    }
    if (byCouncil.has('merribek')) byCouncil.set('moreland', byCouncil.get('merribek'));

    // D3/Vega geographic paths require the opposite ring winding from this source.
    // Reverse every ring so the polygons fill Victoria, not the whole map canvas.
    const reorient = geometry => ({
      ...geometry,
      coordinates: geometry.type === 'Polygon'
        ? geometry.coordinates.map(ring => [...ring].reverse())
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates.map(polygon => polygon.map(ring => [...ring].reverse()))
          : geometry.coordinates
    });

    // Match each council’s library data to its geographic boundary.
    const features = geojson.features.filter(feature => feature && feature.type === 'Feature' && feature.geometry)
      .map(feature => {
        const council = feature.properties?.Council || '';
        const values = byCouncil.get(normalise(council)) || {};
        return {
          type: 'Feature', geometry: reorient(feature.geometry),
          properties: {
            ...feature.properties,
            Council: council,
            Membership: Number.isFinite(values.Membership) ? values.Membership : null,
            Visits: Number.isFinite(values.Visits) ? values.Visits : null
          }
        };
      });
    if (!features.length) throw new Error('No council polygons found');

    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      background: '#fffdf9', width: 760, height: 530,
      projection: { ...councilMaps.projection },
      data: { values: features },
      params: [{ name: 'libraryMeasure', value: 'Membership',
        bind: { input: 'select', options: ['Membership', 'Visits'],
          labels: ['Library membership indicator', 'Library visits per resident'],
          name: 'Colour councils by: ' } }],
      transform: [{ calculate: "libraryMeasure === 'Membership' ? datum.properties.Membership : datum.properties.Visits", as: 'SelectedValue' }],
      mark: { type: 'geoshape', stroke: '#ffffff', strokeWidth: 1.1 },
      encoding: {
        color: {
          condition: { test: 'isValid(datum.SelectedValue)', field: 'SelectedValue', type: 'quantitative',
            scale: { scheme: 'reds' },
            legend: { title: 'Reported indicator', orient: 'bottom', gradientLength: 340,
              titleFontSize: 16, labelFontSize: 14 } },
          value: '#e7e5e1'
        },
        tooltip: [
          { field: 'properties.Council', type: 'nominal', title: 'Council' },
          { field: 'properties.Membership', type: 'quantitative', title: 'Membership indicator', format: '.3f' },
          { field: 'properties.Visits', type: 'quantitative', title: 'Visits per resident', format: '.2f' }
        ]
      },
      config: { view: { stroke: null }, legend: { labelColor: '#25465b', titleColor: '#25465b' } }
    };
    await councilCharts.showChart(8, spec);
  } catch (error) {
    councilCharts.showError(8, error);
  }
})();
