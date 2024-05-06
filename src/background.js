/*global chrome*/

// 如果菜单未创建，则创建右键菜单项
chrome.contextMenus.create({
    id: "copyDivElements",
    title: "复制指定 div 下的元素",
    contexts: ["all"]
});

// 监听右键菜单项的点击事件
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    // 检查点击的菜单项的ID是否与我们创建的菜单项匹配
    if (info.menuItemId === "copyDivElements") {
        // 向内容脚本发送消息
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {"message": "Hello, content script!"});
        });
    }
});

