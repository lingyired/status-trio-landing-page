import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { SettingsPanel } from './SettingsPanel'
import type { StatusIconState } from '../status/StatusIcon'

/** 面板顶端与菜单栏之间的呼吸。尖角就长在这段空隙里（landing.css 里那个 top: 10px 同义）。 */
const TOP_GAP = 10

/** 面板贴到视口边缘时至少留出的白边 */
const EDGE = 12

/** 尖角中线至少离面板左右边缘这么远——再近就骑到 16px 的圆角上了 */
const CARET_INSET = 24

/** 从「钉在菜单栏下方」滑到「预览卡右侧」要走多远的滚动距离。
 *  太短像被弹过去，太长面板会在正文中间悬很久。 */
const TRAVEL = 320

/** 落位线：预览行上沿滑到菜单栏下方这么深的地方时，面板正好贴上它、之后一起滚。
 *  取 340 是为了让「停下来看卡片」时两者已经并排——要是把落位线放在菜单栏下沿，
 *  得滚到卡片顶天立地才并排，用户停在中途就只看见面板还挂在顶上。 */
const LOCK_DEPTH = 340

/** 并排时首屏与面板之间的横向留白 */
const HERO_GAP = 28

/** 并排要求首屏至少还有这么宽。再窄首屏会被挤成一条、比不并排更难看，
 *  那就退回「占位槽占高度、首屏排在面板下面」的老布局。 */
const MIN_HERO_W = 380

interface Props {
  open: boolean
  state: StatusIconState
  onChange: (patch: Partial<StatusIconState>) => void
  /** 菜单栏上那个 Status Trio 图标：停靠时面板以它的中心为锚点 */
  anchorRef: RefObject<HTMLElement | null>
  /** 预览卡右侧的落位槽：滚到那儿时面板就挪过去（见 MenubarPreview） */
  slotRef: RefObject<HTMLElement | null>
  /** 面板实测宽度：预览行按它给槽位留宽，两者并排才不会挤到 */
  onWidth: (width: number) => void
  /** 面板实测高度：预览卡按它对齐高度，落位后两张卡上下沿齐平 */
  onHeight: (height: number) => void
}

/**
 * 设置面板有两个落位，位置全部由滚动进度算出来（见 sync），所以过渡是连续的，
 * 不走 CSS 动画时间轴、也不会和滚动手感脱节：
 * - **停靠**：钉在菜单栏正下方，面板中心对准菜单栏图标（贴边时靠尖角指回去）；
 * - **落位**：滚到「菜单栏实际尺寸」卡片时滑进它右侧的槽位，往后就跟着卡片一起滚，
 *   回到顶部再反向滑回来。
 * 它在文档流里的占位分两种（见 sync 的第 ③ 步）：
 * - **并排**（宽屏、面板左边的空档够放首屏）：占位槽高度写 0，首屏顶到内容列最上面、
 *   与面板顶端齐平，首屏只占左侧那条空档（宽度由 --hero-w 交给 CSS）；
 * - **占位**（窄窗口 / 窄屏）：槽高 = 面板实测高度 + 间距，首屏排在面板下面，不会被压住。
 * 窄屏下（见 landing.css）面板退回普通文档流、落位关掉，避免钉住以后遮掉大半屏。
 */
export function SettingsDock({ open, state, onChange, anchorRef, slotRef, onWidth, onHeight }: Props) {
  const dockRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  /** 上一次「并排 / 占位」的落定结果。没有它的话下面这段每帧都会被叫醒、反复写同样的样式。 */
  const liftKeyRef = useRef('')

  /**
   * 量一次几何、摆一次位置。全程只读几何再统一写样式——读写交错会逼浏览器反复重排。
   * 这段会在滚动帧里被叫醒很多次，所以只碰 DOM 样式，不动 React state（别触发整棵树重渲染）。
   */
  const sync = useCallback(() => {
    const dock = dockRef.current
    const body = bodyRef.current
    if (!dock || !body) return

    const dockRect = dock.getBoundingClientRect()
    const dockLeft = dockRect.left
    // offsetWidth/Height：布局尺寸，不受收起动画的 scale 影响
    const width = body.offsetWidth
    const height = body.offsetHeight
    // 用滚动区自己的 clientWidth/Height：内层滚动条占掉的那几像素也算进去
    const scroller = dock.closest('.lp-desktop')
    const viewport = scroller?.clientWidth ?? document.documentElement.clientWidth
    const viewportHeight = scroller?.clientHeight ?? document.documentElement.clientHeight

    // ① 停靠位（相对占位槽）：面板中心对准图标中心。图标就贴着屏幕右边，
    //    面板没地方再往右让，所以夹进视口白边——靠尖角指回图标（真 macOS 弹层同款）。
    //    窄屏下面板本来就占满整列，对齐没有意义，直接贴 0。
    const anchor = anchorRef.current?.getBoundingClientRect()
    const center = anchor ? anchor.left + anchor.width / 2 : viewport / 2
    const full = width >= dock.clientWidth - 1
    const dockDx = full
      ? 0
      : Math.min(
          Math.max(center - width / 2 - dockLeft, EDGE - dockLeft),
          Math.max(EDGE - dockLeft, viewport - EDGE - width - dockLeft),
        )

    // ② 落位：预览卡右侧的槽。槽位没空出来（窄屏 / 横向放不下时它是 display: none）
    //    宽度就是 0，比面板窄 → 保持停靠，别硬挤过去把卡片压扁。
    const dockY = dockRect.top + TOP_GAP
    const slotRect = slotRef.current?.getBoundingClientRect()
    const slot = slotRect && slotRect.width >= width - 0.5 ? slotRect : null

    let t = 0
    let dx = dockDx
    let y = 0
    if (slot) {
      // 落位线夹一下：视口太矮时别让面板贴着屏幕底边才并排
      const lockY = dockY + Math.min(LOCK_DEPTH, Math.max(0, viewportHeight - TOP_GAP) * 0.55)
      const p = Math.min(1, Math.max(0, (lockY + TRAVEL - slot.top) / TRAVEL))
      // smoothstep：两端速度都是 0 —— 起步接得上「钉在菜单栏下方」的静止，
      // 落定那一刻接得上「跟着卡片 1:1 走」，所以两头都不会有顿挫。
      // 线性插值在落定处速度是 0.06：面板静止、卡片却在高速上滚，会梗一下。
      t = p * p * (3 - 2 * p)
      dx = dockDx + (slot.left - dockLeft - dockDx) * t
      y = (slot.top - dockY) * t
    }

    // ③ 首屏跟面板并排：面板浮在右上，首屏顶到内容列最上面、只占它左边的空档，
    //    于是「Status Trio / macOS 菜单栏小工具」那一行跟面板顶端基本齐平。
    //    空档不够宽（窄窗口 / 窄屏）就不并排，退回「占位槽占高度、首屏排在面板下面」。
    const freeLeft = dockDx - HERO_GAP
    const lifted = !full && freeLeft >= MIN_HERO_W

    // 落定之后面板随卡片滚出视野，别让它继续往屏幕外堆坐标（离屏还挂着滤镜很亏），
    // 到底了顺便摘掉可见性——否则 Tab 还能走到一堆看不见的控件上。
    const minY = -(height + TOP_GAP + 24)
    const parked = y <= minY + 0.5

    body.style.setProperty('translate', `${dx}px ${Math.max(y, minY)}px`)
    body.style.visibility = parked ? 'hidden' : ''
    const caret = caretRef.current
    if (caret) {
      // 尖角相对面板左边缘；走起来就淡出——它只在停靠时负责说明「这块属于谁」
      caret.style.left = `${Math.min(Math.max(center - dockLeft - dx, CARET_INSET), width - CARET_INSET)}px`
      caret.style.opacity = String(1 - t)
    }

    // 并排 / 占位：只在这几个量真的变了才写样式。高度也走这里（不走 React 的 style prop）——
    // 命令式写入和 re-render 会互相覆盖。占位时才占高度，并排时交给 CSS 抵消那道 gap。
    const liftKey = `${lifted}|${lifted ? Math.round(freeLeft) : 0}|${body.dataset.open}|${height}`
    if (liftKey !== liftKeyRef.current) {
      const first = liftKeyRef.current === ''
      liftKeyRef.current = liftKey
      // 首帧还没量到尺寸时别让 260ms 的高度动画把整页内容拖着滑一下
      if (first) dock.style.transition = 'none'
      dock.style.height = !lifted && body.dataset.open === 'true' ? `${height + TOP_GAP}px` : '0px'
      dock.dataset.lifted = String(lifted)
      dock.parentElement?.style.setProperty('--hero-w', lifted ? `${freeLeft}px` : 'none')
      if (first) {
        requestAnimationFrame(() => {
          dock.style.transition = ''
        })
      }
    }
  }, [anchorRef, slotRef])

  // 布局阶段摆一次位置并量一次尺寸。刻意不带依赖：任何一种会导致重排的原因（开合、换语言、
  // 面板宽度/高度变化让预览行重新留槽）都会先走一轮渲染，这里正好在绘制前收尾，不会闪。
  const reported = useRef({ w: 0, h: 0 })

  /**
   * 量一次面板的 border-box 尺寸并上报：
   * - 宽度 → 预览行给落位槽留宽（两者并排才不会挤到）；
   * - 高度 → 预览卡按它对齐（落位后两张卡上下沿齐平）。
   * 值没变就不报——ResizeObserver 会因宽度变化顺带触发一次回调，别让父组件白渲染一轮。
   */
  const reportSize = useCallback(() => {
    const body = bodyRef.current
    if (!body) return
    if (body.offsetWidth !== reported.current.w) {
      reported.current.w = body.offsetWidth
      onWidth(body.offsetWidth)
    }
    if (body.offsetHeight !== reported.current.h) {
      reported.current.h = body.offsetHeight
      onHeight(body.offsetHeight)
    }
  }, [onWidth, onHeight])

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (body) reportSize()
    sync()
  })

  useEffect(() => {
    const dock = dockRef.current
    const body = bodyRef.current
    if (!dock || !body) return

    // 滚动帧里只允许每帧算一次
    let queued = 0
    const schedule = () => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        sync()
      })
    }

    // 尺寸：占位槽的高度与预览卡的等高都靠它；换语言、控件折行、断点切换时跟着变
    const size = new ResizeObserver(() => {
      reportSize()
      schedule()
    })
    size.observe(body)

    // 主循环：面板跟着滚动从菜单栏下方一路滑到预览卡右侧
    const scroller = dock.closest('.lp-desktop')
    scroller?.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    // 图标左边是弹性空隙、右边是固定宽度，所以时钟文本一变（或换语言）它会平移
    const bar = anchorRef.current?.closest('.lp-menubar')
    const barObserver = bar ? new MutationObserver(schedule) : null
    barObserver?.observe(bar as Element, { childList: true, subtree: true, characterData: true })

    return () => {
      if (queued) cancelAnimationFrame(queued)
      size.disconnect()
      scroller?.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      barObserver?.disconnect()
    }
  }, [sync, anchorRef, reportSize])

  // 高度由 sync() 按「并排 / 占位」直接写，所以这里刻意不给 style prop：
  // React 会在下次渲染把没列出来的内联属性清掉，跟命令式写入打架。
  return (
    <div className="pg-dock" ref={dockRef}>
      <div
        className="pg-dock-body"
        ref={bodyRef}
        data-open={open}
        aria-hidden={!open}
        inert={!open}
      >
        <span className="pg-caret" ref={caretRef} aria-hidden />
        <SettingsPanel state={state} onChange={onChange} />
      </div>
    </div>
  )
}
