/* global chrome, buildCopyStyleCss */

var result;
var currTarget;
var isClickRight = false;
var enable = false;

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
  try {
    currTarget.style.outline = '';
  } catch (e) {
  }
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.code === 1) {
    if (enable) {
      copyToClipboard(result);
    }
    isClickRight = false;
  } else if (request.code === 2) {
    enable = !enable;
    if (enable) {
      isClickRight = false;
    }
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
