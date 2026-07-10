/*global chrome*/

var globalEnabled = false;

var ICON_ON = {
  16: '/src/assets/icons/logo-16.png',
  32: '/src/assets/icons/logo-32.png',
  48: '/src/assets/icons/logo-48.png'
};

var ICON_OFF = {
  16: '/src/assets/icons/logo-gray-16.png',
  32: '/src/assets/icons/logo-gray-32.png',
  48: '/src/assets/icons/logo-gray-48.png'
};

function setGlobalIcon(enabled) {
  chrome.action.setIcon({
    path: enabled ? ICON_ON : ICON_OFF
  }, function () {
    void chrome.runtime.lastError;
  });
}

function broadcastEnable(enabled) {
  chrome.tabs.query({}, function (tabs) {
    if (!tabs) {
      return;
    }
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      if (tab.id == null) {
        continue;
      }
      chrome.tabs.sendMessage(tab.id, {code: 2, enable: enabled}, function () {
        void chrome.runtime.lastError;
      });
    }
  });
}

function setGlobalEnabled(enabled) {
  globalEnabled = !!enabled;
  chrome.storage.local.set({globalEnabled: globalEnabled});
  setGlobalIcon(globalEnabled);
  broadcastEnable(globalEnabled);
}

chrome.storage.local.get('globalEnabled', function (data) {
  globalEnabled = !!(data && data.globalEnabled);
  setGlobalIcon(globalEnabled);
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'copyCssStyle' && tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, {code: 1}, function () {
      void chrome.runtime.lastError;
    });
  }
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.contextMenus.create({id: 'copyCssStyle', title: 'copy css style', contexts: ['all']});
    chrome.tabs.create({url: 'https://github.com/XFSeven7/copyCssStyle'});
  }
});

chrome.action.onClicked.addListener(function () {
  setGlobalEnabled(!globalEnabled);
});

// content 注入后询问当前全局开关；已开页/新开页都据此对齐
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.code === 3) {
    sendResponse({enable: globalEnabled});
  }
});
