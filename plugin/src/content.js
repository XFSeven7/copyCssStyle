/*global chrome*/

// 提取主要样式
const propertyArr = ['color', 'font-size', 'width', 'height', 'background', 'padding', 'border-radius', 'border', 'box-shadow', "transform",
    'line-height', 'display', 'align-items', 'flex-direction', 'justify-content', 'position', 'text-align', 'object-fit', 'opacity', 'overflow'];

// 定义一个对象，用于存储可能的默认值
const defaultValues = {
    'color': 'rgb(0, 0, 0)', // 黑色，但通常继承自父元素
    'font-size': '16px', // 默认字体大小
    'width': 'auto', // 宽度默认自动
    'height': 'auto', // 高度默认自动
    'background': 'rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box', // 背景默认透明
    'padding': '0px', // 内边距默认为0
    'border-radius': '0px', // 圆角默认为0
    'border': '0px', // 边框默认无
    'box-shadow': 'none', // 阴影默认无
    'transform': 'none', // 变形默认无
    'line-height': 'normal', // 行高默认为normal
    'display': 'block', // 根据元素类型不同而不同，块级元素默认为block
    'align-items': 'normal', // Flex容器中项目的默认对齐方式为stretch
    'flex-direction': 'row', // Flex容器的默认方向为row
    'justify-content': 'normal', // Flex容器中内容的默认对齐方式为flex-start
    'position': 'static', // 定位默认为static
    'text-align': 'start', // 文本对齐默认为start
    'object-fit': 'fill', // 替换元素的默认对象填充方式为fill
    'opacity': '1', // 透明度默认为完全不透明
    'overflow': 'visible' // 默认溢出内容可见
};

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
        if (!isDefaultValue(propertyArr[i], propertyValue)) {
            result += "\t" + propertyArr[i] + ": " + propertyValue + ";\n";
        }
    }
    result += "}";

});

// 检查是否为默认值的函数
function isDefaultValue(property, value) {
    if (value.includes(defaultValues[property])) {
        return true;
    }
    return !value || value === 'none' || value === '0px' || value === defaultValues[property];
}

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
