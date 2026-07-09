# 智能精简 CSS 复制 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用同标签空白探针对比替代硬编码默认值，精简白名单，使复制的 CSS 更准、更短。

**Architecture:** 把「白名单 + 探针 + 差分格式化」抽到无 Chrome API 的 `cssDiff.js`，供 content script 与浏览器自检页共用；`content.js` 只负责开关、悬停 outline、右键复制。探针同步挂载/读取/移除，探针本身不加样式。

**Tech Stack:** Chrome MV3 content script、原生 DOM/`getComputedStyle`、无测试框架的 HTML 自检页。

**Spec:** `docs/superpowers/specs/2026-07-10-smart-css-diff-design.md`

---

## File structure

| 文件 | 职责 |
|------|------|
| `plugin/src/cssDiff.js` | 白名单、探针创建/清理、差分、格式化为 `.copy_style{...}` |
| `plugin/src/content.js` | 启用开关、mouseover/out、消息、剪贴板；调用 `buildCopyStyleCss` |
| `plugin/manifest.json` | content_scripts 增加 `cssDiff.js`（须在 `content.js` 之前） |
| `plugin/test/self-check.html` | 浏览器打开即可跑的最小断言自检 |
| `plugin/src/background.js` | **不改** |

---

### Task 1: 抽出 `cssDiff.js` 并写失败自检

**Files:**
- Create: `plugin/src/cssDiff.js`
- Create: `plugin/test/self-check.html`

- [ ] **Step 1: 创建空壳 `cssDiff.js`（函数先抛错，保证自检先红）**

```js
/* global window */

var PROPERTY_ARR = [
  'color', 'font-size', 'font-weight', 'line-height', 'text-align',
  'background', 'border', 'border-radius', 'box-shadow', 'padding',
  'opacity', 'transform', 'width', 'height'
];

function createProbe(tagName) {
  throw new Error('not implemented');
}

function removeProbe(probe) {
  throw new Error('not implemented');
}

/**
 * @param {Element} target
 * @returns {string|null} `.copy_style{...}` 或挂载失败时 null
 */
function buildCopyStyleCss(target) {
  throw new Error('not implemented');
}

if (typeof window !== 'undefined') {
  window.PROPERTY_ARR = PROPERTY_ARR;
  window.createProbe = createProbe;
  window.removeProbe = removeProbe;
  window.buildCopyStyleCss = buildCopyStyleCss;
}
```

- [ ] **Step 2: 创建自检页 `plugin/test/self-check.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>cssDiff self-check</title>
</head>
<body>
  <pre id="out">running…</pre>
  <script src="../src/cssDiff.js"></script>
  <script>
    (function () {
      var lines = [];
      function assert(cond, msg) {
        if (!cond) throw new Error(msg);
        lines.push('OK: ' + msg);
      }

      try {
        var el = document.createElement('div');
        el.style.color = 'rgb(255, 0, 0)';
        el.style.borderRadius = '8px';
        el.style.width = '120px';
        el.style.height = '40px';
        document.body.appendChild(el);

        var css = buildCopyStyleCss(el);
        assert(css !== null, 'buildCopyStyleCss returns string');
        assert(css.indexOf('.copy_style{') === 0, 'starts with .copy_style{');
        assert(/color:\s*rgb\(255,\s*0,\s*0\)/.test(css), 'includes custom color');
        assert(css.indexOf('border-radius:') !== -1, 'includes border-radius');
        assert(css.indexOf('width:') !== -1, 'includes width');
        assert(css.indexOf('height:') !== -1, 'includes height');
        assert(css.indexOf('display:') === -1, 'no display (not in whitelist)');
        assert(css.indexOf('position:') === -1, 'no position');
        assert(css.indexOf('flex-direction:') === -1, 'no flex-direction');

        var bare = document.createElement('div');
        document.body.appendChild(bare);
        var bareCss = buildCopyStyleCss(bare);
        assert(bareCss !== null, 'bare div returns string');
        // 空白 div 相对探针应极少或无差异（允许空规则块）
        var body = bareCss.replace(/^\.copy_style\{\n?/, '').replace(/\n?\}$/, '').trim();
        assert(body.length < 80, 'bare div output stays short: ' + JSON.stringify(body));

        // 探针不得残留
        assert(!document.querySelector('[data-copy-css-probe]'), 'probe cleaned up');

        document.body.removeChild(el);
        document.body.removeChild(bare);
        lines.push('ALL PASSED');
      } catch (e) {
        lines.push('FAIL: ' + e.message);
      }
      document.getElementById('out').textContent = lines.join('\n');
    })();
  </script>
</body>
</html>
```

- [ ] **Step 3: 用浏览器打开自检页，确认失败**

Run: 用 Chrome 打开 `plugin/test/self-check.html`（或 `open plugin/test/self-check.html`）

Expected: 页面显示 `FAIL: not implemented`（或同类错误）

- [ ] **Step 4: Commit 空壳 + 自检**

```bash
git add plugin/src/cssDiff.js plugin/test/self-check.html
git commit -m "$(cat <<'EOF'
测试：cssDiff 自检页与空壳模块

EOF
)"
```

---

### Task 2: 实现探针差分逻辑

**Files:**
- Modify: `plugin/src/cssDiff.js`

- [ ] **Step 1: 实现 `createProbe` / `removeProbe` / `buildCopyStyleCss`**

完整替换 `plugin/src/cssDiff.js` 为：

```js
/* global window */

var PROPERTY_ARR = [
  'color', 'font-size', 'font-weight', 'line-height', 'text-align',
  'background', 'border', 'border-radius', 'box-shadow', 'padding',
  'opacity', 'transform', 'width', 'height'
];

function createProbe(tagName) {
  var probe = document.createElement(tagName);
  probe.setAttribute('data-copy-css-probe', '1');
  // 探针不加任何作者样式，避免污染 width/height
  var parent = document.body || document.documentElement;
  if (!parent) {
    return null;
  }
  parent.appendChild(probe);
  return probe;
}

function removeProbe(probe) {
  if (probe && probe.parentNode) {
    probe.parentNode.removeChild(probe);
  }
}

/**
 * @param {Element} target
 * @returns {string|null}
 */
function buildCopyStyleCss(target) {
  if (!target || !target.tagName) {
    return null;
  }

  var probe = null;
  try {
    probe = createProbe(target.tagName);
    if (!probe) {
      return null;
    }

    var targetStyle = window.getComputedStyle(target);
    var probeStyle = window.getComputedStyle(probe);
    var out = '.copy_style{\n';

    for (var i = 0; i < PROPERTY_ARR.length; i++) {
      var prop = PROPERTY_ARR[i];
      var tv = targetStyle.getPropertyValue(prop);
      var pv = probeStyle.getPropertyValue(prop);
      if (tv !== pv) {
        out += '\t' + prop + ': ' + tv + ';\n';
      }
    }

    out += '}';
    return out;
  } finally {
    removeProbe(probe);
  }
}

if (typeof window !== 'undefined') {
  window.PROPERTY_ARR = PROPERTY_ARR;
  window.createProbe = createProbe;
  window.removeProbe = removeProbe;
  window.buildCopyStyleCss = buildCopyStyleCss;
}
```

- [ ] **Step 2: 再开自检页，确认通过**

Run: 刷新 `plugin/test/self-check.html`

Expected: `ALL PASSED`；含 `OK: includes custom color` 等行

若 `bare div output stays short` 因浏览器对空 div 算出非默认 `width`/`height` 而失败：把该断言阈值放宽为「不含 `display`/`position`/`flex-direction`」，并在自检注释里注明原因（仍符合 spec 验收 1「接近空或极少」）。

- [ ] **Step 3: Commit**

```bash
git add plugin/src/cssDiff.js plugin/test/self-check.html
git commit -m "$(cat <<'EOF'
实现：同标签空白探针差分 CSS

EOF
)"
```

---

### Task 3: 接入 `content.js` 并更新 manifest

**Files:**
- Modify: `plugin/src/content.js`
- Modify: `plugin/manifest.json`

- [ ] **Step 1: 重写 `content.js`，删除硬编码默认值，调用 `buildCopyStyleCss`**

完整替换 `plugin/src/content.js` 为：

```js
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
```

- [ ] **Step 2: 更新 `manifest.json` 的 content_scripts（`cssDiff.js` 在前）**

将 `content_scripts[0].js` 改为：

```json
"js": [
  "src/cssDiff.js",
  "src/content.js"
]
```

其余字段不动。可选：`"version": "1.2"`。

- [ ] **Step 3: 手动冒烟（Chrome 加载已解压扩展）**

1. `chrome://extensions` → 开发者模式 →「加载已解压的扩展程序」选 `plugin/`（或刷新已有项）
2. 打开任意页 → 点插件图标开启 → 悬停未改样式的 `div` → 右键 Copy css style → 粘贴：应接近空或极少属性
3. 悬停明显改过颜色/圆角的按钮 → 复制结果含对应项，**不含** `display` / `flex-direction` / `position`
4. 对设了固定宽高的元素：结果含 `width` / `height`
5. 再点图标关闭：悬停不再出红框

- [ ] **Step 4: Commit**

```bash
git add plugin/src/content.js plugin/manifest.json
git commit -m "$(cat <<'EOF'
接入：content 使用探针差分并精简白名单

EOF
)"
```

---

### Task 4: 对照 spec 收尾核对

**Files:** 无新文件

- [ ] **Step 1: 核对清单（全部打勾才算完成）**

- [ ] 硬编码 `defaultValues` / `isDefaultValue` 已从仓库消失（`rg defaultValues plugin/` 无匹配）
- [ ] 白名单与 spec 一致（含 `font-weight`、`width`、`height`；无 flex/position/overflow）
- [ ] 探针带 `data-copy-css-probe`，自检确认清理
- [ ] `background.js` 未改
- [ ] 自检页仍显示 `ALL PASSED`

- [ ] **Step 2: 若有自检断言微调，一并提交**

```bash
git add -u plugin/
git status
# 若有改动：
git commit -m "$(cat <<'EOF'
修正：自检断言与探针差分边界

EOF
)"
```

---

## Spec coverage（自检）

| Spec 要求 | Task |
|-----------|------|
| 同标签空白对比 | Task 2 |
| 精简白名单 + width/height | Task 1–2 `PROPERTY_ARR` |
| 删除硬编码默认值 | Task 3 |
| 探针无作者样式 + try/finally 清理 | Task 2 |
| 挂载失败返回 null、不更新 result | Task 2–3 |
| 交互流程不变 | Task 3 |
| 最小自检 | Task 1–2 |
| background / 权限不动 | Task 3 仅改 js 列表 |

无 TBD/占位实现步骤。函数名全程统一：`buildCopyStyleCss` / `createProbe` / `removeProbe` / `PROPERTY_ARR`。
