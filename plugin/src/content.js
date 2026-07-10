/* global chrome, buildCopyStyleCss */

var result;
var currTarget;
var isClickRight = false;
var enable = false;

function clearOutline() {
  try {
    if (currTarget) {
      currTarget.style.outline = '';
    }
  } catch (e) {
  }
}

function applyEnable(next) {
  enable = !!next;
  if (enable) {
    isClickRight = false;
  } else {
    clearOutline();
  }
}

// 注入后同步全局开关（已开启时，新开页/刷新页也直接可用）
try {
  chrome.runtime.sendMessage({code: 3}, function (response) {
    if (chrome.runtime.lastError) {
      return;
    }
    if (response && typeof response.enable === 'boolean') {
      applyEnable(response.enable);
    }
  });
} catch (e) {
}

document.addEventListener('mouseover', function (event) {
  if (!enable) {
    return;
  }
  if (isClickRight) {
    return;
  }

  currTarget = event.target;
  currTarget.style.outline = '1px dashed rgb(255, 0, 0)';

  var css = buildCopyStyleCss(event.target);
  if (css !== null) {
    result = css;
  }
});

document.addEventListener('contextmenu', function () {
  isClickRight = true;
});

document.addEventListener('mouseout', function () {
  clearOutline();
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.code === 1) {
    if (enable) {
      copyToClipboard(result);
    }
    isClickRight = false;
  } else if (request.code === 2) {
    applyEnable(request.enable);
  }
});

function copyToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
