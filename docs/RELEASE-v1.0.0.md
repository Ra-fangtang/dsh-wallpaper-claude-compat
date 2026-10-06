# v1.0.0 — 让壁纸和 claude-style 不再互相盖住

首个发布版：一张**限域样式表**，让 `dsh-plugin-wallpaper-engine` 的壁纸透出 `dsh-claude-style` 画在页面外壳上的实色画布。

## 修的是什么

| 插件 | 它怎么画 |
|---|---|
| **dsh-plugin-wallpaper-engine** | 壁纸挂成 `body` 上一个 `position:fixed; z-index:-2` 的图层（`.we-layer`），靠 `body[data-we-wallpaper]{--dsw-alias-bg-base:transparent; …}` 让位 |
| **dsh-claude-style** | 「整页换肤」：**不透明的画布色直接画在外壳上**（`#root` / 对话列 / 侧栏 / 窗口外框），几处带 `!important`，且**不读**上面那两个令牌 |

更隐蔽的是：皮肤在 `body[data-dsh-claude-style][data-ds-dark-theme]` 上重设 `--dsw-alias-bg-base`，
**特异性与壁纸插件的清底完全相同**，只是排在后面 —— 清底被反超，画布恢复实色，壁纸整片被压住。

## 装

```sh
dsh plugin --profile desktop add github:Ra-fangtang/dsh-wallpaper-claude-compat
```

再把 `dsh-wallpaper-claude-compat` 追加到 profile `package.json` 的 `dsh.profile.bundles` 末尾，
**完全退出并重启**（宿主侧插件开机才加载）。`dsh web` 同理。

## 亮点

- **限域**：只在两个标记同时存在时生效，任一插件关掉即整体失效，不留痕迹。
- **只清外壳背景**：皮肤的配色、字体、排版、交互、弹层一概不碰。
- **不赌样式表顺序**：特异性 (0,8,2) 压过皮肤最高的 (0,5,1)，带不带 `!important` 都稳赢。
- **零依赖、零构建**：源码即产物，装了就能用。

## 验证

- 无头 Chrome 里把皮肤样式表**追加在本表之后**（顺序最不利）：暗色/亮色各 7 项断言全过。
- 壁纸未激活时皮肤原值保持不变（负向）。
- 按包名解析 / import / `inject` / `apply` 推入的注入行类型逐项核对。

完整改动见 [CHANGELOG.md](../CHANGELOG.md)。

**Full Changelog**: https://github.com/Ra-fangtang/dsh-wallpaper-claude-compat/commits/v1.0.0
