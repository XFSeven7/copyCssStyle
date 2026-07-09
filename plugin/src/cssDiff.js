/* global window */

var PROPERTY_ARR = [
  'color', 'font-size', 'font-weight', 'line-height', 'text-align',
  'background', 'border', 'border-radius', 'box-shadow', 'padding',
  'opacity', 'transform', 'width', 'height'
];

function createProbe(tagName) {
  throw new Error('not implemented');
}

function removeProbe(probe) {
  throw new Error('not implemented');
}

/**
 * @param {Element} target
 * @returns {string|null} `.copy_style{...}` 或挂载失败时 null
 */
function buildCopyStyleCss(target) {
  throw new Error('not implemented');
}

if (typeof window !== 'undefined') {
  window.PROPERTY_ARR = PROPERTY_ARR;
  window.createProbe = createProbe;
  window.removeProbe = removeProbe;
  window.buildCopyStyleCss = buildCopyStyleCss;
}
