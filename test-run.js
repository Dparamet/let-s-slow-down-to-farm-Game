const fs = require('fs');
const html = fs.readFileSync(__dirname + '/code.html', 'utf8');
const parts = html.split('<script>');
const main = parts[parts.length - 1].split('</script>')[0];

const ctx = {
  clearRect() {}, fillRect() {}, arc() {}, fill() {}, beginPath() {},
  createLinearGradient() { return { addColorStop() {} }; },
  save() {}, restore() {}, clip() {}, stroke() {}, drawImage() {},
  createRadialGradient() { return { addColorStop() {} }; },
  lineTo() {}, moveTo() {}, quadraticCurveTo() {}, closePath() {}, ellipse() {}, translate() {},
  fillStyle: '', strokeStyle: '', lineWidth: 0, globalAlpha: 1,
  set lineCap(v) {}, set lineJoin(v) {}
};

function el(id) {
  return {
    id,
    getContext: () => ctx,
    addEventListener() {},
    classList: { add() {}, remove() {}, contains: () => id === 'start-screen' ? false : false },
    style: { display: '', pointerEvents: '' },
    clientWidth: 800,
    clientHeight: 600,
    getBoundingClientRect: () => ({ width: 800, height: 600 }),
    textContent: '',
    value: '50',
    setAttribute() {},
    dataset: {},
    closest: () => null,
    disabled: false,
    width: 800,
    height: 600
  };
}

global.document = {
  getElementById: el,
  querySelectorAll: () => [],
  addEventListener() {}
};
global.window = {
  gameConfig: null,
  mode: 'play',
  __wmUserStarted: false,
  addEventListener() {},
  requestAnimationFrame() {},
  cancelAnimationFrame() {},
  performance: { now: () => 0 },
  setTimeout(fn) { try { fn(); } catch (e) { console.error('timeout err', e.message); } },
  clearTimeout() {},
  lib: {
    getAsset: () => undefined,
    log: console.log,
    showGameParameters: () => {},
    getUserGameState: async () => ({ state: null })
  }
};

try {
  eval(main);
  run('play').then(() => console.log('run OK')).catch((e) => console.error('run FAIL', e.message, e.stack?.split('\n').slice(0, 5).join('\n')));
} catch (e) {
  console.error('eval FAIL', e.message);
  console.error(e.stack?.split('\n').slice(0, 8).join('\n'));
}
