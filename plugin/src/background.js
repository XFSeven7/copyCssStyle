/*global chrome*/

// 监听右键菜单项的点击事件
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "copyCssStyle") {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {code: 1});
        });
    }
});

// 安装监听
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install" || details.reason === "update") {
        chrome.contextMenus.create({id: "copyCssStyle", title: "copy css style", contexts: ["all"]});
        chrome.tabs.create({url: "https://github.com/XFSeven7/copyStyle"});
    }
});

// 监听插件图标的点击事件
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {code: 2});
    });
});
