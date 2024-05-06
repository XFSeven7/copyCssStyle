// 创建遮罩层元素
const overlay = document.createElement("div");
overlay.id = "overlay";
document.body.appendChild(overlay);


const inlineDiv = document.createElement('div');
inlineDiv.id = "copy_style_inline";
document.body.appendChild(inlineDiv);

const inlineStyles = inlineDiv.style;

let currtarget;

// 监听鼠标移动事件
document.addEventListener("mousemove", function (event) {

    const targetElement = event.target;

    console.log("定位DIV");

    currtarget = targetElement;

    const rect = targetElement.getBoundingClientRect();

    // 设置遮罩层位置和大小
    overlay.style.display = "block";
    overlay.style.top = rect.top + "px";
    overlay.style.left = rect.left + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";

    // console.log(targetElement);

});

// 隐藏遮罩层
document.addEventListener("mouseout", function () {
    overlay.style.display = "none";
});


// 监听来自后台页面的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    console.log("复制DIV");

    // 获取元素的计算后的样式
    const computedStyles = window.getComputedStyle(currtarget);
    const computedStylesinline = window.getComputedStyle(inlineDiv);

    let a = ".class_style{\n";

    // 遍历计算后的样式对象，输出手动修改的样式属性
    for (let i = 0; i < computedStyles.length; i++) {

        const property = computedStyles[i];
        console.log(property);

        const computedValue = computedStyles.getPropertyValue(property);
        const inlineValue = computedStylesinline.getPropertyValue(property);

        // 处理 box-shadow 样式
        // if (property === "box-shadow") {
        //     computedValue = computedStyles.boxShadow;
        // }

        // 如果计算后的值和内联样式的值不同，则说明该属性是手动修改的
        if (computedValue !== inlineValue) {
            console.log(property + ': ' + computedValue);
            if (property.includes("-webkit")) {
                continue;
            }
            a += "\t" + property + ': ' + computedValue + ";\n";
        }

    }

    a += "}";

    copyToClipboard(a);

    alert("复制成功");

});

function copyToClipboard(text) {
    // 创建一个临时的 textarea 元素
    var textarea = document.createElement("textarea");
    // 将要复制的文本设置为 textarea 的值
    textarea.value = text;
    // 将 textarea 元素添加到文档中
    document.body.appendChild(textarea);
    // 选中 textarea 中的文本
    textarea.select();
    // 执行复制操作
    document.execCommand('copy');
    // 从文档中移除 textarea 元素
    document.body.removeChild(textarea);
}

