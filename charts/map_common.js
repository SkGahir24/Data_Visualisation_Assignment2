// Shared Vega-Lite geography: focus on Victoria, using a local Natural Earth
// Australian coastline. This is NOT a Victorian council boundary dataset.
const councilMaps = {
 async facilities(){
  if(!this._facilities) this._facilities=fetch('data/facilities.json').then(r=>{if(!r.ok)throw Error('facilities.json missing');return r.json()}).then(a=>a.filter(d=>Number.isFinite(+d.Latitude)&&Number.isFinite(+d.Longitude)&&+d.Latitude>=-39.3&&+d.Latitude<=-33.8&&+d.Longitude>=140.9&&+d.Longitude<=150.1));
  return this._facilities;
 },
 projection:{type:'mercator',center:[145.35,-37.1],scale:3950},
 backdrop(){return {data:{url:'data/countries.topojson',format:{type:'topojson',feature:'ne_110m_admin_0_countries'}},transform:[{filter:"datum.properties.NAME == 'Australia'"}],mark:{type:'geoshape',fill:'#e9e4d8',stroke:'#839e99',strokeWidth:1.4}}},
 // Load real Victorian suburb/locality polygons. The full source is hosted by publicdata.au.
 // If offline, the maps still display with the locally packaged council boundaries.
 async suburbLines(){
   if(!this._suburbLines) this._suburbLines=(async()=>{
     const sources=['data/victoria_suburbs.geojson','https://publicdata.au/d/au-localities-vic/v/2026-08-17/data.geojson'];
     for(const url of sources){
       try{
         const response=await fetch(url);
         if(!response.ok) continue;
         const geo=await response.json();
         if(geo.type==='FeatureCollection' && geo.features?.length>1000){
           return {data:{values:geo.features},mark:{type:'geoshape',filled:false,stroke:'#8e999b',strokeWidth:0.35,opacity:0.45}};
         }
       }catch(e){console.warn('Suburb boundary source unavailable:',url,e.message)}
     }
     return null;
   })();
   return this._suburbLines;
 },

 // Suburb names are derived from the same real locality polygons used for outlines.
 // Only a curated subset is displayed at the overview scale to prevent label clutter.
 async suburbLabels(){
   if(!this._suburbLabels) this._suburbLabels=(async()=>{
     const preferred=new Set(['MELBOURNE','CARLTON','FITZROY','RICHMOND','ST KILDA','FOOTSCRAY','BRUNSWICK','PRESTON','NORTHCOTE','HAWTHORN','KEW','CAMBERWELL','BOX HILL','DONCASTER','HEIDELBERG','SUNSHINE','WERRIBEE','POINT COOK','WILLIAMSTOWN','FRANKSTON','DANDENONG','SPRINGVALE','CLAYTON','OAKLEIGH','CAULFIELD','BRIGHTON','SANDRINGHAM','CHELTENHAM','MORDIALLOC','BERWICK','CRANBOURNE','PAKENHAM','GEELONG','BALLARAT','BENDIGO','SHEPPARTON','WANGARATTA','WODONGA','MILDURA','WARRNAMBOOL','TRARALGON','SALE','BAIRNSDALE','HORSHAM','SWAN HILL','ECHUCA','COLAC','PORTLAND','ARARAT','BENALLA','BACCHUS MARSH','GISBORNE','KYNETON','CASTLEMAINE','MARYBOROUGH','MORWELL','LEONGATHA','WONTHAGGI','LARA','TORQUAY','OCEAN GROVE','DRYSDALE','MOUNT ELIZA','MORNINGTON','ROSEBUD','SORRENTO','LILYDALE','RINGWOOD','CROYDON','BELGRAVE','FERNTREE GULLY','NARRE WARREN']);
     for(const url of ['data/victoria_suburbs.geojson','https://publicdata.au/d/au-localities-vic/v/2026-08-17/data.geojson']){
       try{
         const response=await fetch(url);if(!response.ok)continue;
         const geo=await response.json();if(!Array.isArray(geo.features))continue;
         const labels=[];
         for(const f of geo.features){
           const p=f.properties||{};
           const name=String(p.LOCALITY_NAME||p.LOC_NAME||p.LOCALITY||p.locality||p.name||p.NAME||p.suburb||p.Suburb||p.SSC_NAME||'').trim();
           if(!preferred.has(name.toUpperCase()))continue;
           const geometry=f.geometry;if(!geometry)continue;
           const rings=geometry.type==='Polygon'?geometry.coordinates:geometry.type==='MultiPolygon'?geometry.coordinates.flat(1):[];
           let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
           for(const ring of rings)for(const pt of ring){if(!Array.isArray(pt))continue;minX=Math.min(minX,pt[0]);maxX=Math.max(maxX,pt[0]);minY=Math.min(minY,pt[1]);maxY=Math.max(maxY,pt[1]);}
           if(!Number.isFinite(minX))continue;
           labels.push({Suburb:name,Longitude:(minX+maxX)/2,Latitude:(minY+maxY)/2});
         }
         if(labels.length)return labels;
       }catch(e){console.warn('Suburb labels unavailable:',e.message)}
     }
     return [];
   })();
   return this._suburbLabels;
 },
 async suburbNameLayer(){
   const labels=await this.suburbLabels();
   if(!labels.length)return null;
   return {data:{values:labels},mark:{type:'text',font:'Arial',fontSize:9,fontWeight:600,color:'#40545a',opacity:0.8,stroke:'#fffdf9',strokeWidth:2,paintOrder:'stroke',dy:-5},encoding:{longitude:{field:'Longitude',type:'quantitative'},latitude:{field:'Latitude',type:'quantitative'},text:{field:'Suburb',type:'nominal'},tooltip:[{field:'Suburb',type:'nominal',title:'Suburb'}]}};
 },
 councilLines(){return {data:{url:'data/victoria_lga.geojson',format:{type:'json',property:'features'}},mark:{type:'geoshape',filled:false,stroke:'#637b80',strokeWidth:0.7,opacity:0.6}};},
 async draw(n,layers){const spec={$schema:'https://vega.github.io/schema/vega-lite/v5.json',width:760,height:530,background:'#fffdf9',projection:n===1?{type:'mercator',center:[145.25,-37.15],scale:3300}:this.projection,layer:layers,config:{view:{stroke:null}}};await vegaEmbed('#chart'+n,spec,{actions:false,renderer:'svg'});this.ensureZoomButtons(n);this.addMapLegend(n);},
 addMapLegend(n){
   const chart=document.getElementById('chart'+n);
   if(!chart)return;
   let legend=chart.querySelector('.map-readable-legend');
   if(legend)legend.remove();
   legend=document.createElement('div');legend.className='map-readable-legend';
   if(n===1)legend.innerHTML='<strong>Recreation facilities per council</strong><span class="map-legend-gradient"></span><span>Fewer facilities &nbsp;←&nbsp; light peach &nbsp; | &nbsp; dark red &nbsp;→&nbsp; More facilities</span><span class="map-legend-note">Circle size also represents the number of recreation facilities.</span>';
   if(n===2)legend.innerHTML='<strong>Recreation facility locations</strong><span class="map-dot-legend"></span><span>Each orange dot represents one recorded recreation facility.</span>';
   if(n===3)legend.innerHTML='<strong>Recreation facilities per hexagon</strong><span class="map-legend-gradient hex"></span><span>Fewer facilities &nbsp;←&nbsp; yellow &nbsp; | &nbsp; red &nbsp;→&nbsp; More facilities</span>';
   chart.appendChild(legend);
 },
 // Viewport zoom/pan is applied to the rendered SVG, keeping all Vega-Lite layers together.
 ensureZoomButtons(n){
   const chart=document.getElementById('chart'+n);
   if(!chart)return;
   chart.classList.add('map-zoom-enabled');
   // Vega-Embed clears its target on each render; always recreate controls afterward.
   if(chart.querySelector('.map-zoom-controls'))return;
   const controls=document.createElement('div');
   controls.className='map-zoom-controls';
   controls.setAttribute('role','group');
   controls.setAttribute('aria-label','Zoom map '+n);
   controls.innerHTML='<button type="button" data-zoom="in" title="Zoom in" aria-label="Zoom in">+</button><button type="button" data-zoom="out" title="Zoom out" aria-label="Zoom out">−</button><button type="button" data-zoom="reset" title="Reset map" aria-label="Reset map">↺</button>';
   chart.appendChild(controls);
   let scale=1,dx=0,dy=0,drag=false,lastX=0,lastY=0;
   const target=()=>chart.querySelector('.vega-embed svg');
   const apply=()=>{const svg=target();if(svg){svg.style.transformOrigin='center center';svg.style.transform=`translate(${dx}px,${dy}px) scale(${scale})`;}};
   const zoom=(factor)=>{const next=Math.max(1,Math.min(8,scale*factor));scale=next;if(scale===1){dx=0;dy=0;}apply();};
   controls.addEventListener('click',e=>{
     const action=e.target.closest('button')?.dataset.zoom;
     if(action==='in')zoom(1.5);
     if(action==='out')zoom(1/1.5);
     if(action==='reset'){scale=1;dx=0;dy=0;apply();}
   });
   chart.addEventListener('wheel',e=>{if(!e.ctrlKey||e.target.closest('.map-zoom-controls'))return;e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15);},{passive:false});
   chart.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('.map-zoom-controls'))return;drag=true;lastX=e.clientX;lastY=e.clientY;chart.setPointerCapture(e.pointerId);});
   chart.addEventListener('pointermove',e=>{if(!drag||scale<=1)return;dx+=e.clientX-lastX;dy+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;apply();});
   chart.addEventListener('pointerup',()=>{drag=false;});
   chart.addEventListener('pointercancel',()=>{drag=false;});
 },
 error(n,e){console.error(e);document.querySelector('#chart'+n).innerHTML='<div class="chart-error">Map '+n+': '+String(e.message).replaceAll('<','&lt;')+'</div>';},
 grid(points){const size=.36,cells=new Map();for(const p of points){const x=Math.floor((+p.Longitude-140.9)/size),y=Math.floor((+p.Latitude+39.3)/size),key=x+','+y;cells.set(key,(cells.get(key)||0)+1)}return [...cells].map(([key,count])=>{const [x,y]=key.split(',').map(Number),a=140.9+x*size,b=-39.3+y*size;return {type:'Feature',properties:{Count:count},geometry:{type:'Polygon',coordinates:[[[a,b],[a+size,b],[a+size,b+size],[a,b+size],[a,b]]]}}})}
};
