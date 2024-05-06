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

    currtarget = targetElement;

    const rect = targetElement.getBoundingClientRect();

    // 设置遮罩层位置和大小
    overlay.style.display = "block";
    overlay.style.top = rect.top + "px";
    overlay.style.left = rect.left + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";


    // 通过遍历 DOMTokenList 对象来获取每个类名
    currtarget.classList.forEach(className => {
        console.log(className);
    });

// 使用 contains 方法来检查特定的类名是否存在
//     if (classNames.contains('className')) {
//         console.log('该元素应用了 className 类');
//     }


});

// 隐藏遮罩层
document.addEventListener("mouseout", function () {
    overlay.style.display = "none";
});


// 监听来自后台页面的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    // console.log("jquery是否初始化：" + $);
    //
    // // 将原生 DOM 元素转换为 jQuery 对象
    // const $targetElement = $(currtarget);
    //
    // // 获取元素的所有样式属性
    // const allStyles = $targetElement.css();
    // console.log('所有样式：', allStyles);

    // // 获取元素的特定样式
    // const color = $targetElement.css('color');
    // const fontSize = $targetElement.css('font-size');
    // console.log('颜色：', color);
    // console.log('字体大小：', fontSize);
    //
    // // 检查是否有伪类样式
    // const hasHoverStyle = $targetElement.is(':hover');
    // console.log('是否有:hover样式：', hasHoverStyle);
    //
    // // 检查是否有指定类名的样式
    // const hasClassStyle = $targetElement.hasClass('yourClassName');
    // console.log('是否有指定类名的样式：', hasClassStyle);

    // 获取元素的计算后的样式co
    const computedStyles = window.getComputedStyle(currtarget);
    const computedStylesinline = window.getComputedStyle(inlineDiv);


// 获取常见的 CSS 样式属性值
    const color = computedStyles.getPropertyValue('color');
    const fontSize = computedStyles.getPropertyValue('font-size');
    const backgroundColor = computedStyles.getPropertyValue('background-color');
    const width = computedStyles.getPropertyValue('width');
    const height = computedStyles.getPropertyValue('height');
    const marginTop = computedStyles.getPropertyValue('margin-top');
    const marginRight = computedStyles.getPropertyValue('margin-right');
    const marginBottom = computedStyles.getPropertyValue('margin-bottom');
    const marginLeft = computedStyles.getPropertyValue('margin-left');
    const paddingTop = computedStyles.getPropertyValue('padding-top');
    const paddingRight = computedStyles.getPropertyValue('padding-right');
    const paddingBottom = computedStyles.getPropertyValue('padding-bottom');
    const paddingLeft = computedStyles.getPropertyValue('padding-left');
    const borderWidth = computedStyles.getPropertyValue('border-width');
    const borderColor = computedStyles.getPropertyValue('border-color');
    const borderRadius = computedStyles.getPropertyValue('border-radius');
    const display = computedStyles.getPropertyValue('display');
    const position = computedStyles.getPropertyValue('position');
    const zIndex = computedStyles.getPropertyValue('z-index');
    const textAlign = computedStyles.getPropertyValue('text-align');
    const textDecoration = computedStyles.getPropertyValue('text-decoration');
    const fontFamily = computedStyles.getPropertyValue('font-family');
    const fontWeight = computedStyles.getPropertyValue('font-weight');
    const fontStyle = computedStyles.getPropertyValue('font-style');
    const lineHeight = computedStyles.getPropertyValue('line-height');

    // 获取阴影的样式属性值
    const boxShadow = computedStyles.getPropertyValue('box-shadow');

    console.log('阴影：', boxShadow);
    console.log('颜色：', color);
    console.log('字体大小：', fontSize);
    console.log('背景颜色：', backgroundColor);
    console.log('宽度：', width);
    console.log('高度：', height);
    console.log('上边距：', marginTop);
    console.log('右边距：', marginRight);
    console.log('下边距：', marginBottom);
    console.log('左边距：', marginLeft);
    console.log('上内边距：', paddingTop);
    console.log('右内边距：', paddingRight);
    console.log('下内边距：', paddingBottom);
    console.log('左内边距：', paddingLeft);
    console.log('边框宽度：', borderWidth);
    console.log('边框颜色：', borderColor);
    console.log('边框圆角：', borderRadius);
    console.log('显示方式：', display);
    console.log('定位方式：', position);
    console.log('层叠顺序：', zIndex);
    console.log('文本对齐：', textAlign);
    console.log('文本装饰：', textDecoration);
    console.log('字体族：', fontFamily);
    console.log('字体粗细：', fontWeight);
    console.log('字体样式：', fontStyle);
    console.log('行高：', lineHeight);




    let result = ".copy_style{\n";

    // 遍历计算后的样式对象，输出手动修改的样式属性
    for (let i = 0; i < computedStyles.length; i++) {

        const property = computedStyles[i];
        // console.log(property);

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
            result += "\t" + property + ': ' + computedValue + ";\n";
        }

    }

    result += "}";

    console.log(result)

    copyToClipboard(result);

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

