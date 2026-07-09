# 智能精简 CSS 复制（同标签空白对比）

日期：2026-07-10  
状态：已批准（对话确认）

## 背景

copyCssStyle 通过固定属性白名单 + `getComputedStyle` 复制样式，再用硬编码 `defaultValues` 过滤「默认值」。问题：

- 默认值判断不准（`includes` 误判、跨标签/浏览器默认不一致）
- 白名单偏杂（flex/position/overflow 等），输出偏长，不利于「粘贴后最快看到效果」

## 目标

复制结果更准、更短：只保留与**同标签空白元素**计算样式不同的视觉核心属性（含布局宽高），交互流程不变。

## 非目标

- 不改操作流程（快捷键、一键复制、设置页等）
- 不做完整长手属性拆解（如拆开全部 `border-*`）
- 不做可配置白名单
- 不改 `background.js` / 权限模型（除非实现时发现必须）
- 本次不强制改 README；版本号可顺手 +0.1，非必须

## 方案

**方案 1：空白同标签对比 + 精简白名单**

悬停时创建与目标相同 `tagName` 的空白探针节点，对比双方 `getComputedStyle` 在白名单上的值；仅输出不相等的属性。删除 `defaultValues` / `isDefaultValue`。

曾考虑但未采用：

- 方案 2（长手属性拆开）：输出更干净，但实现更重，本次不做
- 方案 3（只修硬编码表）：改动小，但默认值问题治标不治本

## 架构与数据流

改动集中在 `plugin/src/content.js`。

```
悬停目标元素
  → 红色虚线 outline
  → 创建同 tag 空白探针并挂载
  → getComputedStyle(目标) vs getComputedStyle(探针)
  → 白名单逐项对比，只保留值不同的
  → 拼成 .copy_style { ... } → result
  → 销毁探针

右键「copy css style」
  → background 发 code:1
  → content 将 result 写入剪贴板
```

插件开关（图标点击 code:2）、右键菜单逻辑保持现状。

## 探针约定

- `document.createElement(target.tagName)`，**探针本身不设任何 class / 作者样式**（避免污染 `width`/`height` 等计算值）
- 挂到 `document.body`；失败则挂 `document.documentElement`
- 同步执行：挂载 → `getComputedStyle` → 移除；空节点同帧内完成，不依赖给探针加隐藏样式来防闪屏
- 若实现时仍需隐藏：只用**外层 wrapper** 承载定位/隐藏，探针作为无样式子节点（对比只读探针）
- 创建/挂载/读取包在 `try/finally`，保证清理
- 选中态 `outline` 不在白名单，不进入输出

## 白名单

```
color, font-size, font-weight, line-height, text-align,
background, border, border-radius, box-shadow, padding,
opacity, transform, width, height
```

相对现状：去掉 `display`、flex 相关、`position`、`object-fit`、`overflow`；增加 `font-weight`；保留 `width` / `height`。

## 对比与输出规则

- 比较：`targetValue !== probeValue`（`getComputedStyle` 字符串全等）
- 输出格式不变：

```css
.copy_style{
	color: ...;
	font-size: ...;
}
```

- `background` / `border` 简写可能较长：接受（方案 1 取舍）；与探针相同则整条不输出
- 继承属性（如 `color`）：探针挂在页面下会吃到页面继承，可能少拷「整页统一色」——接受，更偏相对页面基线的差异
- 悬停频繁：每次 mouseover 建拆探针，不做缓存
- `result` 为空时：保持现状，不额外弹窗

## 边界情况

| 情况 | 处理 |
|------|------|
| 探针挂载失败 | 该次不更新 `result` |
| `img` / `input` 等宽高 | 照常对比，有差异则输出像素值 |
| outline 选中态 | 不在白名单，忽略 |

## 错误处理

- 探针生命周期：`try/finally` 必清理
- `mouseout` 清 outline：继续吞异常（现状）
- 剪贴板：继续 `document.execCommand('copy')`，本次不换 API

## 文件改动

| 文件 | 变更 |
|------|------|
| `plugin/src/content.js` | 精简白名单；探针对比；删除硬编码默认值逻辑 |
| `plugin/src/background.js` | 不动 |
| `plugin/manifest.json` | 不动（版本号可选 +0.1） |

## 验收标准

1. 未改样式的普通 `div`：复制结果接近空或极少属性
2. 改了颜色 / 圆角 / 阴影的按钮：能拷出对应项，且无默认 flex/position 噪音
3. 显式宽高与探针不同时：输出含 `width` / `height`
4. 开关与右键复制流程与现在一致

## 自检

实现时留一个最小可跑检查（无测试框架）：对带内联样式的假节点做探针对比，断言输出含预期非默认项、不含与探针相同的白名单项。
