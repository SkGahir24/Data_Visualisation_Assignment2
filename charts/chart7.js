// Chart 7: Parallel coordinates for five years of library service costs.
async function drawChart7() {
  const performance = await councilCharts.readData('performance');
  const costs = councilCharts.getIndicator(performance, 'LB5')
    .filter(row => row.Result >= 0);
  const latest = costs
    .filter(row => row.Year === councilCharts.year)
    .sort((first, second) => second.Result - first.Result);
  const councils = [...new Set(latest.slice(0, 6).map(row => row.Council))];
  const years = councilCharts.years;
  const rows = costs.filter(row =>
    councils.includes(row.Council) && years.includes(row.Year)
  );
  // Each year is a vertical axis. Lines connect each council's cost across those axes.
  // Keep a common scale because every axis measures the same cost-per-resident indicator.
  const palette = ['#2d5878', '#d34e56', '#e19b35', '#258e8c', '#8061a8', '#60945d'];
  const color = { field:'Council', type:'nominal', scale:{domain:councils,range:palette},
    legend:{title:'Council',labelFontSize:13,titleFontSize:15,labelLimit:195,symbolStrokeWidth:4} };
  const x = {field:'Year',type:'ordinal',sort:years,title:'Financial year',
    axis:{labelAngle:0,labelFontSize:14,titleFontSize:17,labelPadding:12,titlePadding:18,grid:true,gridColor:"#cbd9df",gridWidth:1.5}};
  const y = {field:'Result',type:'quantitative',title:'Direct library service cost per resident (LGPRF LB5)',
    scale:{zero:true},axis:{labelFontSize:13,titleFontSize:16,titlePadding:15,grid:false,tickCount:6}};
  const tooltip = [{field:'Council',type:'nominal',title:'Council'},
    {field:'Year',type:'ordinal',title:'Financial year'},
    {field:'Result',type:'quantitative',title:'Cost per resident',format:',.2f'}];
  const chart = {
    $schema:'https://vega.github.io/schema/vega-lite/v5.json',
    background:'transparent',width:'container',height:490,
    data:{values:rows},
    encoding:{x,y,color,detail:{field:'Council',type:'nominal'},tooltip},
    layer:[
      {mark:{type:'line',strokeWidth:3,point:false,opacity:0.9},
        encoding:{order:{field:'Year',sort:'ascending'}}},
      {mark:{type:'circle',size:125,stroke:'#fff',strokeWidth:1.5,filled:true},
        encoding:{} }
    ],
    config:{view:{stroke:null},axis:{labelColor:'#24455a',titleColor:'#17334b'},
      legend:{labelColor:'#24455a',titleColor:'#17334b'}}
  };
  await councilCharts.showChart(7, chart);
}
drawChart7().catch(error => councilCharts.showError(7, error));
