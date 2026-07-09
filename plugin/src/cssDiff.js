/* global window */

var PROPERTY_ARR = [
  'color', 'font-size', 'font-weight', 'line-height', 'text-align',
  'background', 'border', 'border-radius', 'box-shadow', 'padding',
  'opacity', 'transform', 'width', 'height'
];

function createProbe(tagName) {
  var probe = document.createElement(tagName);
  probe.setAttribute('data-copy-css-probe', '1');
  // 探针不加任何作者样式，避免污染 width/height
  var parent = document.body || document.documentElement;
  if (!parent) {
    return null;
  }
  parent.appendChild(probe);
  return probe;
}

function removeProbe(probe) {
  if (probe && probe.parentNode) {
    probe.parentNode.removeChild(probe);
  }
}

/**
 * @param {Element} target
 * @returns {string|null}
 */
function buildCopyStyleCss(target) {
  if (!target || !target.tagName) {
    return null;
  }

  var probe = null;
  try {
    probe = createProbe(target.tagName);
    if (!probe) {
      return null;
    }

    var targetStyle = window.getComputedStyle(target);
    var probeStyle = window.getComputedStyle(probe);
    var out = '.copy_style{\n';

    for (var i = 0; i < PROPERTY_ARR.length; i++) {
      var prop = PROPERTY_ARR[i];
      var tv = targetStyle.getPropertyValue(prop);
      var pv = probeStyle.getPropertyValue(prop);
      if (tv !== pv) {
        out += '\t' + prop + ': ' + tv + ';\n';
      }
    }

    out += '}';
    return out;
  } finally {
    removeProbe(probe);
  }
}

if (typeof window !== 'undefined') {
  window.PROPERTY_ARR = PROPERTY_ARR;
  window.createProbe = createProbe;
  window.removeProbe = removeProbe;
  window.buildCopyStyleCss = buildCopyStyleCss;
}
