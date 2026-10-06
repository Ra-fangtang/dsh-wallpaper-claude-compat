# dsh-wallpaper-claude-compat

一张**限域样式表**，让 [dsh-plugin-wallpaper-engine](https://github.com/elysia395/dsh-wallpaper-engine) 的壁纸透出 [dsh-claude-style](https://github.com/Nwflower/dsh-claude-style) 画在页面外壳上的实色画布。

装了两个插件却发现壁纸看不见了 —— 就是这里补的那一处。

## 为什么会互相盖住

| 插件 | 它怎么画 |
|---|---|
| **dsh-plugin-wallpaper-engine** | 壁纸挂成 `body` 上一个 `position:fixed; z-index:-2` 的图层（`.we-layer`），靠把外壳令牌清成透明来「让开」：`body[data-we-wallpaper]{--dsw-alias-bg-base:transparent; --dsw-specific-sidebar-fill:transparent}` |
| **dsh-claude-style** | 「整页换肤」：**不透明的画布色直接画在页面外壳上**（`#root` / 对话列 / 侧栏 / 窗口外框），关键几处带 `!important`，而且**不读**上面那两个令牌 |

更隐蔽的一层：皮肤在 `body[data-dsh-claude-style][data-ds-dark-theme]` 上重设 `--dsw-alias-bg-base`，
**特异性与壁纸插件的清底完全相同**，只是它的样式表后插进 `<head>` —— 于是壁纸插件的清底被反超，
外壳画布恢复实色，壁纸整片被压在下面。

## 补丁做什么

纯宿主插件（**没有客户端 bundle**）：在 `index.html` 的 `<head>` 注入一张限域样式表。

- **限域**：只在 `body` 同时带 `data-dsh-claude-style`（皮肤启用）与 `data-we-wallpaper`（壁纸激活）时命中。
  任一插件关掉/卸载，这张表整体不生效 —— 页面与你原来的皮肤一模一样。
- **只清外壳背景**：`#root`、对话列、侧栏、窗口外框（含 Windows 标题栏条）→ 透明。
  皮肤的配色、字体、排版、交互、弹层（搜索面板、用量卡片、账号菜单）一概不碰。

## 三个让它真正生效的细节

1. **不赌样式表顺序**：皮肤的表是运行时后插到 `<head>` 的，本表却由 index 注入、天生排在前面。
   所以选择器把两个标记属性各重复 4 遍并加 `html` 前缀，特异性抬到 (0,8,2)（皮肤最高 (0,5,1)）——
   同一份声明带不带 `!important` 都稳赢。
2. **变量传播**：皮肤在侧栏元素**自己身上**用 `!important` 重设 `--dsw-specific-sidebar-fill`。
   只覆盖 `body` 上的变量没用 —— 元素自己那条 `!important` 会把「带 !important 的父级值」重新捡回去。
   所以侧栏元素自己的 `background` / `background-color` 必须一并接管。
3. **令牌**：壁纸插件的清底不带 `!important`，会被皮肤反超。本表用 `!important` 把这批令牌重新清一遍，
   等于把壁纸插件的清底顶到皮肤之上。

细节与理由都写在 [`host/index.js`](host/index.js) 的注释里（改动前请先读）。

## 安装

从本仓直接装（桌面端与 `dsh web` 都可以）：

```sh
dsh plugin --profile desktop add github:Ra-fangtang/dsh-wallpaper-claude-compat
```

然后把 `dsh-wallpaper-claude-compat` 追加到 profile `package.json` 的 `dsh.profile.bundles` 末尾，
**完全退出再启动**桌面端（宿主侧插件开机才加载）；`dsh web` 装完重启该命令即可。

本地开发用 `link:`：

```sh
dsh plugin --profile desktop add link:/path/to/dsh-wallpaper-claude-compat
```

## 关闭 / 卸载

在 **设置 → 插件** 里关掉这个组合包即可（本插件是独立 bundle，与两个目标插件互不依赖）；
或从 `dsh.profile.bundles` 与 `dependencies` 里删掉本包，重启后页面恢复原样。

## 排查

| 现象 | 怎么办 |
|---|---|
| 壁纸还是被盖住 | 确认 `body` 上两个标记都在：DevTools 里看 `document.body.dataset`（应有 `dshClaudeStyle` 与 `weWallpaper`）。缺前者 = 皮肤没挂上；缺后者 = 壁纸没激活（没有真在播的壁纸时，壁纸插件自己也会保持宿主原色） |
| 壁纸出来了，但文字看不清 | 那是壁纸插件的可读性/暗化档位（设置 → Wallpaper Engine → 外观/播放），与本插件无关 |
| 皮肤一关，界面变透 | 不该发生：本表限域在 `data-dsh-claude-style` 上。若真出现，请提 issue |

## 兼容性

- 目标：`dsh-plugin-wallpaper-engine` 1.3.x 与 `dsh-claude-style` 0.10.x（规则按这两个版本的实际样式表逐条核对）。
- 皮肤换了选择器、壁纸插件换了图层标记时本表可能失配 —— 用上面「排查」一节的 DevTools 检查最快定位。

## 许可

MIT。
