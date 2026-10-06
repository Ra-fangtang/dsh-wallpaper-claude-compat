# 更新日志

本项目的所有重要改动都记在这里。版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-10-06

首个发布版。

### 新增

- **限域样式表**：只在 `body` 同时带 `data-dsh-claude-style`（皮肤启用）与 `data-we-wallpaper`（壁纸激活）时命中。
  任一插件关闭或卸载，整张表不生效 —— 页面与原生皮肤完全一致，不留痕迹。
- **清掉皮肤画在外壳上的实色画布**：
  - `#root`
  - 对话列：`[data-pane="conversation"]` / `[class*="centerCol"]` / `.dshDesktopConversationSurface`
  - 侧栏：`[data-pane="sidebar"]` / `[class*="sidebarCol"]` / `.dshDesktopSidebarSurface`
  - 窗口外框：`[class*="_frame"]` 及其 `::before`（Windows 标题栏条）
- **纯宿主插件**：无客户端 bundle、无依赖、无构建步骤 —— 经 `webserver/index-inject` 以一条 `style` 行注入 `<head>`。

### 设计要点

- **不赌样式表顺序**：皮肤的表是运行时后插到 `<head>` 的，本表由 index 注入、天生排在前面。
  因此把两个标记属性各重复 4 遍并加 `html` 前缀，特异性抬到 (0,8,2)（皮肤最高 (0,5,1)）——
  同一份声明带不带 `!important` 都稳赢。
- **变量传播**：皮肤在侧栏元素**自己身上**用 `!important` 重设 `--dsw-specific-sidebar-fill`；
  只覆盖 `body` 上的变量会被元素自己那条「带 !important 的父级值」捡回去，所以侧栏元素自身的
  `background` / `background-color` 必须一并接管。
- **令牌**：壁纸插件的清底不带 `!important`，会被皮肤同特异性的 `body[data-dsh-claude-style][data-ds-dark-theme]` 反超；
  本表以 `!important` 把 `--dsw-alias-bg-base` / `--dsw-specific-sidebar-fill` 重新清成透明。

### 验证

- **层叠**（无头 Chrome）：把 dsh-claude-style 的规则**逐条抄自其源码**、并**故意追加在本表之后**（顺序最不利），
  暗色与亮色各 7 项断言全部通过：`#root` / 对话列 / 侧栏 / 窗口外框的背景为透明，
  `--dsw-alias-bg-base` 与 `--dsw-specific-sidebar-fill` 为 `transparent`。
- **负向**：壁纸未激活时本表不命中，皮肤原值（暗色 `#141413`）保持不变。
- **安装**：按包名解析并 import 成功（与 Loader 同路径）、`inject: ["webServer"]`、
  `apply` 恰好推入一条 `style` 行、`cordis.patch.yml` 可解析。

### 兼容

- 目标：`dsh-plugin-wallpaper-engine` 1.3.x、`dsh-claude-style` 0.10.x（按这两个版本的实际样式表逐条核对）。
- 要求：DSH ≥ 0.1.7（与 dsh-claude-style 的下限一致；本插件依赖 `webserver/index-inject` 的 `style` 行）。
  `dsh web` 与桌面端都可以。
