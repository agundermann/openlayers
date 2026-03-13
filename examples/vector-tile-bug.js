import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Polygon from '../src/ol/geom/Polygon.js';
import VectorTileLayer from '../src/ol/layer/VectorTile.js';
import Projection from '../src/ol/proj/Projection.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';
import TileGrid from '../src/ol/tilegrid/TileGrid.js';

let hue = 200;

const source = new VectorTileSource({
  tileGrid: new TileGrid({
    origin: [0, 0],
    resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2],
    tileSize: 64,
  }),

  tileUrlFunction: (tileCoord) => tileCoord.join('/'),

  tileLoadFunction: (tile, url) => {
    const tileCoord = url.split('/').map(Number);
    const extent = source.getTileGrid().getTileCoordExtent(tileCoord);

    setTimeout(() => {
      const [minX, minY, maxX, maxY] = extent;
      const pad = (maxX - minX) * 0.05;
      tile.setFeatures([
        new Feature({
          geometry: new Polygon([
            [
              [minX + pad, minY + pad],
              [maxX - pad, minY + pad],
              [maxX - pad, maxY - pad],
              [minX + pad, maxY - pad],
              [minX + pad, minY + pad],
            ],
          ]),
          color: `hsl(${hue}, 70%, 60%)`,
        }),
      ]);
    }, 100);
  },
});

const layer = new VectorTileLayer({
  source,

  style: {
    'fill-color': ['get', 'color'],
    'stroke-color': '#333',
    'stroke-width': 1,
  },
});

new Map({
  layers: [layer],
  target: 'map',
  minResolution: 0.125,
  maxResolution: 128,
  extent: [-30_000_000, -30_000_000, 30_000_000, 30_000_000],
  projection: new Projection({
    code: 'view',
    units: 'pixels',
    getPointResolution: (resolution) => resolution,
  }),
  view: new View({
    center: [0, 0],
    resolution: 1,
  }),
});

const status = document.getElementById('status');
let tilesLoading = 0;

source.on('tileloadstart', () => {
  ++tilesLoading;
  status.textContent = `Loading ${tilesLoading} tile(s)…`;
});

source.on(['tileloadend', 'tileloaderror'], () => {
  --tilesLoading;
  status.textContent =
    tilesLoading > 0 ? `Loading ${tilesLoading} tile(s)…` : 'Tiles loaded.';
});

const hueValue = document.getElementById('hue-value');
document.getElementById('hue').addEventListener('input', function () {
  hue = parseInt(this.value);
  hueValue.textContent = hue + '°';
  source.changed();
});
