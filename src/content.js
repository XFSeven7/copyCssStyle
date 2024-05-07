/*global chrome*/

// 提取主要样式
const propertyArr = ['color', 'font-size', 'width', 'height', 'background', 'padding', 'border-radius', 'border', 'box-shadow', "transform"];

let result;

// 当前选中的dom元素
let currTarget;

let isClickRight = false;

// 是否可用
let enable = false;

// 监听鼠标移动事件
document.addEventListener("mouseover", function (event) {

    if (!enable) {
        return;
    }

    if (isClickRight) {
        return;
    }

    currTarget = event.target;
    // 绘制选中状态
    currTarget.style.outline = "1px dashed rgb(255, 0, 0)";

    let computedStyle = window.getComputedStyle(event.target);

    result = ".copy_style{\n";
    for (let i = 0; i < propertyArr.length; i++) {
        let propertyValue = computedStyle.getPropertyValue(propertyArr[i]);
        if (propertyValue && propertyValue !== 'none' && propertyValue !== '0px'
            && propertyValue !== "rgb(0, 0, 0)" && propertyValue !== "0px none rgb(0, 0, 0)") {
            result += "\t" + propertyArr[i] + ": " + propertyValue + ";\n";
        }
    }
    result += "}";

});

// 监听右键点击事件
document.addEventListener('contextmenu', function (event) {
    isClickRight = true;
});

// 隐藏选中状态
document.addEventListener("mouseout", function () {
    try {
        currTarget.style.outline = "";
    } catch (e) {
    }
});

// 监听来自后台页面的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // 右键复制
    if (request.code === 1) {
        if (enable) {
            copyToClipboard(result);
        }
        isClickRight = false;
    }
    // 点击插件图标
    else if (request.code === 2) {
        enable = !enable;
        if (enable) {
            isClickRight = false;
        }
    }
});

// 复制字符串到剪切板
function copyToClipboard(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}
