import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { StatusPanel } from './StatusPanel'
import type { StatusIconState } from '../status/StatusIcon'

/** 面板顶端与菜单栏之间的呼吸。尖角就长在这段空隙里（landing.css 里那个 top: 10px 同义）。 */
const TOP_GAP = 10

/** 面板贴到视口边缘时至少留出的白边 */
const EDGE = 12

/** 尖角中线至少离面板左右边缘这么远——再近就骑到 16px 的圆角上了 */
const CARET_INSET = 24

/** 并排时首屏与面板之间的横向留白 */
const HERO_GAP = 28

/** 并排要求首屏至少还有这么宽。再窄首屏会被挤成一条、比不并排更难看，
 *  那就退回「占位槽占高度、首屏排在面板下面」的老布局。 */
const MIN_HERO_W = 380

interface Props {
  open: boolean
  state: StatusIconState
  /** 菜单栏上那个 Status Trio 图标：面板以它的中心为锚点 */
  anchorRef: RefObject<HTMLElement | null>
}

/**
 * 状态面板（App 里点菜单栏图标弹出的那块）长在文档流顶部的占位槽里：
 * - 宽屏：面板浮在右上、首屏占它左边的空档（见 sync 的并排判定）；
 * - 窄窗口 / 窄屏：面板退回全宽文档流，首屏排在下面。
 * 位置只有一种——钉在菜单栏图标正下方（贴边时夹进视口白边、靠尖角指回图标）。
 * 占位槽是 `position: sticky`（见 landing.css）：往下滚面板钉在滚动区顶部不动，
 * 和真弹层一样悬浮；显隐只由点击图标开合。
 */
export function StatusDock({
  open,
  state,
  anchorRef,
}: Props) {
  const dockRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  /** 上一次「并排 / 占位」的落定结果。没有它的话下面这段每帧都会被叫醒、反复写同样的样式。 */
  const liftKeyRef = useRef('')

  /**
   * 量一次几何、摆一次位置。全程只读几何再统一写样式——读写交错会逼浏览器反复重排。
   * 不再监听滚动（面板跟着文档流走），只有尺寸 / 断点 / 菜单栏内容变化需要重算。
   */
  const sync = useCallback(() => {
    const dock = dockRef.current
    const body = bodyRef.current
    if (!dock || !body) return

    const dockRect = dock.getBoundingClientRect()
    const dockLeft = dockRect.left
    // offsetWidth：布局尺寸，不受收起动画的 scale 影响
    const width = body.offsetWidth
    const height = body.offsetHeight
    // 用滚动区自己的 clientWidth：内层滚动条占掉的那几像素也算进去
    const scroller = dock.closest('.lp-desktop')
    const viewport = scroller?.clientWidth ?? document.documentElement.clientWidth

    // ① 水平位置（相对占位槽）：面板中心对准图标中心。图标就贴着屏幕右边，
    //    面板没地方再往右让，所以夹进视口白边——靠尖角指回图标（真 macOS 弹层同款）。
    //    窄屏下面板本来就占满整列，对齐没有意义，直接贴 0。
    const anchor = anchorRef.current?.getBoundingClientRect()
    const center = anchor ? anchor.left + anchor.width / 2 : viewport / 2
    const full = width >= dock.clientWidth - 1
    const dx = full
      ? 0
      : Math.min(
          Math.max(center - width / 2 - dockLeft, EDGE - dockLeft),
          Math.max(EDGE - dockLeft, viewport - EDGE - width - dockLeft),
        )

    body.style.setProperty('translate', `${dx}px 0`)
    const caret = caretRef.current
    if (caret) {
      caret.style.left = `${Math.min(Math.max(center - dockLeft - dx, CARET_INSET), width - CARET_INSET)}px`
    }

    // ② 首屏跟面板并排：面板浮在右上，首屏顶到内容列最上面、只占它左边的空档，
    //    于是「Status Trio / macOS 菜单栏小工具」那一行跟面板顶端基本齐平。
    //    空档不够宽（窄窗口 / 窄屏）就不并排，退回「占位槽占高度、首屏排在面板下面」。
    const freeLeft = dx - HERO_GAP
    const lifted = !full && freeLeft >= MIN_HERO_W

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
  }, [anchorRef])

  // 布局阶段摆一次位置并量一次尺寸。刻意不带依赖：任何一种会导致重排的原因（开合、换语言、
  // 蓝牙列表收起让面板高度变化）都会先走一轮渲染，这里正好在绘制前收尾，不会闪。
  useLayoutEffect(() => {
    sync()
  })

  useEffect(() => {
    const dock = dockRef.current
    const body = bodyRef.current
    if (!dock || !body) return

    // 尺寸：占位槽的高度靠它；换语言、蓝牙列表收起、断点切换时跟着变
    const size = new ResizeObserver(sync)
    size.observe(body)
    window.addEventListener('resize', sync)

    // 图标左边是弹性空隙、右边是固定宽度，所以时钟文本一变（或换语言）它会平移
    const bar = anchorRef.current?.closest('.lp-menubar')
    const barObserver = bar ? new MutationObserver(sync) : null
    barObserver?.observe(bar as Element, { childList: true, subtree: true, characterData: true })

    return () => {
      size.disconnect()
      window.removeEventListener('resize', sync)
      barObserver?.disconnect()
    }
  }, [sync, anchorRef])

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
        <StatusPanel state={state} />
      </div>
    </div>
  )
}
