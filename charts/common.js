// Shared tools used by Charts 4–10.
// Each chart has its own file in this folder.

const councilCharts = {
  files: {},
  year: '2024-25',
  years: ['2020-21', '2021-22', '2022-23', '2023-24', '2024-25'],

  async readData(fileName) {
    if (!this.files[fileName]) {
      const response = await fetch('data/' + fileName + '.json');
      if (!response.ok) {
        throw new Error('Could not open ' + fileName + '.json');
      }
      this.files[fileName] = await response.json();
    }
    return this.files[fileName];
  },

  getIndicator(rows, indicatorId) {
    return rows.filter(row =>
      row.ID === indicatorId && Number.isFinite(row.Result)
    );
  },

  axis(field, type = 'quantitative', title = undefined) {
    const setting = { field: field, type: type };
    if (title !== undefined) setting.title = title;
    return setting;
  },

  makeChart(mark, rows, encoding, options = {}) {
    return {
      background: 'transparent',
      width: 'container',
      height: 340,
      data: { values: rows },
      mark: mark,
      encoding: encoding,
      config: {
        view: { stroke: null },
        axis: {
          labelColor: '#43655e',
          titleColor: '#214c45',
          gridColor: '#e5efea'
        },
        legend: {
          labelColor: '#43655e',
          titleColor: '#214c45'
        }
      },
      ...options
    };
  },

  async showChart(number, specification) {
    const area = document.getElementById('chart' + number);
    if (!area) return;

    try {
      if (typeof vegaEmbed !== 'function') {
        throw new Error('Vega-Lite libraries did not load');
      }
      const rows = specification.data && specification.data.values;
      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('No records available for this chart');
      }

      // Vega-Lite fits the chart to the space beside the explanation.
      const availableWidth = Math.max(260, area.clientWidth - 30);
      // Match selected plots to their adjacent storytelling panels on desktop.
      // Vega-Lite's height is the actual plot height, not just the outer CSS box.
      const tallerCharts = new Set([5, 7, 8, 9, 10]);
      const sidePanel = area.closest('.story-body')?.querySelector('.story-insight');
      const isDesktop = window.matchMedia('(min-width: 851px)').matches;
      const targetHeight = tallerCharts.has(number) && isDesktop && sidePanel
        ? Math.max(440, Math.min(720, Math.round(sidePanel.getBoundingClientRect().height - 65)))
        : specification.height;
      const finalChart = {
        ...specification,
        width: availableWidth,
        height: targetHeight,
        autosize: { type: 'fit', contains: 'padding' }
      };

      await vegaEmbed(area, finalChart, {
        actions: false,
        renderer: 'svg'
      });
      console.info('Chart ' + number + ' loaded');
    } catch (error) {
      console.error('Chart ' + number + ' could not load:', error);
      area.replaceChildren();
      const message = document.createElement('p');
      message.className = 'chart-error';
      message.textContent = 'Chart ' + number + ': ' + error.message;
      area.appendChild(message);
    }
  },

  showError(number, error) {
    const area = document.getElementById('chart' + number);
    console.error('Chart ' + number + ':', error);
    if (area) {
      area.textContent = 'Unable to load chart: ' + error.message;
    }
  }
};
