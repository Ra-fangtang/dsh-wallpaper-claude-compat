/**
 * dsh-wallpaper-claude-compat —— 让 dsh-plugin-wallpaper-engine 的壁纸透出
 * dsh-claude-style 的实色页面底。
 *
 * ── 冲突是怎么来的 ─────────────────────────────────────────────────────────────
 * dsh-plugin-wallpaper-engine 的壁纸挂成 body 上一个 position:fixed、z-index:-2
 * 的图层（.we-layer），然后靠把外壳的令牌清成透明来"让开"：
 *     body[data-we-wallpaper] { --dsw-alias-bg-base: transparent;
 *                               --dsw-specific-sidebar-fill: transparent }
 * dsh-claude-style 走的是"整页换肤"：它不满足于改主题变量，而是把**不透明的画布色
 * 直接画在页面外壳上**（#root / 对话列 / 侧栏 / 窗口外框），关键几处还带 !important。
 * 这些实色值不读上面的令牌，于是壁纸被整片盖住 —— 只看得见皮肤的暖黑。
 *
 * ── 本插件做什么 ───────────────────────────────────────────────────────────────
 * 只注入一张**限域样式表**：当且仅当 body 同时带 data-dsh-claude-style（皮肤启用）
 * 与 data-we-wallpaper（壁纸激活）时，把这几处外壳清成透明。皮肤的配色、排版、
 * 字体、交互一概不碰；壁纸关闭或皮肤关闭时整张表不命中，页面与原生皮肤完全一致。
 *
 * ── 三个让它稳定生效的细节（改动前请先读，勿随手"简化"）────────────────────────
 * ① 特异性：皮肤的页面底规则最高到 (0,5,1) 且带 !important，而本表由 index 注入、
 *    位于 <head> 开头，**顺序上天然吃亏**。所以把两个标记属性各重复 4 遍、再加
 *    html 前缀，抬到 (0,8,2)：同一份声明带不带 !important 都稳赢，不赌样式表顺序。
 * ② 变量传播：皮肤在侧栏元素**自己身上**以 !important 重设
 *    --dsw-specific-sidebar-fill。只覆盖 body 上的变量没用 —— 元素自己那条
 *    !important 会把"带 !important 的父级值"重新捡回去。所以侧栏元素自己的
 *    background / background-color 必须一并接管。
 * ③ 令牌：壁纸插件自己的清底不带 !important，会被皮肤的
 *    body[data-dsh-claude-style][data-ds-dark-theme] 反超（同特异性、皮肤在后）。
 *    本表用 !important 把这批令牌重新清一遍，等于把壁纸插件的清底顶到皮肤之上。
 *
 * 关掉本插件（或卸载）后，两个插件各自恢复原样，不留任何痕迹。
 */

/** 皮肤的 body 标记。 */
const SKIN_ATTR = 'data-dsh-claude-style'
/** 壁纸插件的 body 标记：只在真的有壁纸激活时挂上。 */
const WALLPAPER_ATTR = 'data-we-wallpaper'

/**
 * 限域前缀：html + body + 两个标记属性各 4 遍 = 特异性 (0,8,2)。
 * 重复属性选择器是抬特异性的常规手法 —— 皮肤最高 (0,5,1)，这里留足余量。
 */
const GATE = `html body${(`[${SKIN_ATTR}]`).repeat(4)}${(`[${WALLPAPER_ATTR}]`).repeat(4)}`

/** 需要清成透明的外壳：内容列 / 对话列 / 窗口外框（含 Windows 标题栏条）。 */
const SHELL = [
  '',
  ' #root',
  ' [class*="_frame"]',
  ' [class*="_frame"]::before',
  ' :is([data-pane="conversation"], [class*="centerCol"])',
  ' .dshDesktopConversationSurface',
]

/** 侧栏单独一组：它除了 background，还带着自己的 --dsw-specific-sidebar-fill（见 ②）。 */
const SIDEBAR = ' :is([data-pane="sidebar"], [class*="sidebarCol"], .dshDesktopSidebarSurface)'

const TOKEN_RESET = [
  '  --dsw-alias-bg-base: transparent !important;',
  '  --dsw-specific-sidebar-fill: transparent !important;',
].join('\n')

const CLEAR = [
  TOKEN_RESET,
  '  background: transparent !important;',
  '  background-color: transparent !important;',
].join('\n')

/**
 * 注入到 index.html <head> 的样式表。
 * 导出出来是为了能被测试直接读到（不必启动宿主）。
 */
export const compatCss = [
  '/* dsh-wallpaper-claude-compat: 壁纸激活时让开 dsh-claude-style 的实色外壳。',
  '   限域 = body 上同时有 ' + SKIN_ATTR + ' 与 ' + WALLPAPER_ATTR + '。 */',
  SHELL.map((sel) => GATE + sel).join(',\n') + ' {\n' + CLEAR + '\n}',
  GATE + SIDEBAR + ' {\n' + CLEAR + '\n}',
  '',
].join('\n')

export const name = 'dsh-wallpaper-claude-compat'

/** webServer 是硬依赖：样式表要靠它的 index 注入表进页面。 */
export const inject = ['webServer']

/**
 * 把样式表作为一条 `style` 行推进 index 注入表。
 * @param ctx - 插件上下文。
 */
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: compatCss })
  })
}

export default { name, inject, apply }
