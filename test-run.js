const fs = require('fs');
const nativeSetTimeout = global.setTimeout;
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

const elements = new Map();
let elSeq = 0;

function el(id) {
  if (id && elements.has(id)) return elements.get(id);
  const classState = new Set();
  const listeners = {};
  const node = {
    id,
    getContext: () => ctx,
    addEventListener(type, fn) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    },
    dispatchEvent(event) {
      const e = Object.assign({
        target: node,
        preventDefault() {},
        stopPropagation() {}
      }, event || {});
      (listeners[e.type] || []).forEach(fn => fn(e));
    },
    classList: {
      add(v) { classState.add(v); },
      remove(v) { classState.delete(v); },
      contains: (v) => classState.has(v),
      toggle(v, force) {
        const next = force === undefined ? !classState.has(v) : !!force;
        if (next) classState.add(v); else classState.delete(v);
        return next;
      }
    },
    style: { display: '', pointerEvents: '' },
    clientWidth: 800,
    clientHeight: 600,
    getBoundingClientRect: () => ({ width: 800, height: 600 }),
    textContent: '',
    value: '50',
    setAttribute() {},
    dataset: {},
    closest: () => null,
    querySelectorAll: () => [],
    appendChild() {},
    disabled: false,
    width: 800,
    height: 600
  };
  if (id) elements.set(id, node);
  return node;
}

global.document = {
  getElementById: el,
  createElement: (tag) => el(`${tag}-${++elSeq}`),
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
  setInterval() { return 1; },
  clearTimeout() {},
  clearInterval() {},
  lib: {
    getAsset: () => undefined,
    log: console.log,
    showGameParameters: () => {},
    getUserGameState: async () => ({ state: null })
  }
};
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;
global.setInterval = global.window.setInterval;
global.clearInterval = global.window.clearInterval;
global.fetch = async () => { throw new Error('fetch disabled in test'); };

try {
  eval(main);
  run('play').then(async () => {
    const start = document.getElementById('start-button');
    const starter = document.getElementById('starter-panel');
    const begin = document.getElementById('starter-begin-button');
    const slotsBtn = document.getElementById('continue-button');
    const slots = document.getElementById('slot-panel');

    start.dispatchEvent({ type: 'click' });
    if (!starter.classList.contains('active')) throw new Error('start button did not open starter panel');

    begin.dispatchEvent({ type: 'click' });
    await new Promise(resolve => nativeSetTimeout(resolve, 900));
    if (!document.getElementById('start-screen').classList.contains('hidden')) {
      throw new Error('begin button did not start game');
    }

    window.__wmForceBeginPlay = null;
    document.getElementById('start-screen').classList.remove('hidden');
    slotsBtn.dispatchEvent({ type: 'click' });
    if (!slots.classList.contains('active')) throw new Error('save slots button did not open slot panel');

    console.log('run OK');
  }).catch((e) => console.error('run FAIL', e.message, e.stack?.split('\n').slice(0, 5).join('\n')));
} catch (e) {
  console.error('eval FAIL', e.message);
  console.error(e.stack?.split('\n').slice(0, 8).join('\n'));
}
