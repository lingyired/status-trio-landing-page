/** 双语文案。zh 是基准，en 用同一套键（类型由 zh 推导，缺键会报错）。 */

export type Lang = 'zh' | 'en'

export type WifiStateKey =
  | 'connected'
  | 'notAssociated'
  | 'off'
  | 'noInternet'
  | 'hotspot'
  | 'temporary'
  | 'shared'

export interface FeatureItem {
  icon: string
  title: string
  desc: string
}

const zh = {
  html: {
    title: 'Status Trio · 三个系统状态，一个菜单栏图标',
    description:
      'Status Trio 把 Wi-Fi、电池和音量合并成一个菜单栏图标。原生 Swift 写的 macOS 小工具，不联网、不含遥测。',
  },
  /** macOS 菜单栏里的应用菜单项，两种语言下都保持英文（与真实系统一致） */
  menu: ['File', 'Edit', 'View', 'Window', 'Help'],
  langLabel: '语言',
  themeLabel: '切换深浅主题',
  appLabel: 'Status Trio 菜单栏图标',
  appHint: '点一下到这里调它',

  hero: {
    eyebrow: 'macOS 菜单栏小工具',
    title: '三个系统状态，一个菜单栏图标。',
    desc: 'Wi-Fi、电池、音量，原本散落在菜单栏上的三块地方，如今合成一个紧凑的图标。灵感来自 iPhone Duo 把状态栏合并显示的做法，在 Mac 上重新做了一遍。',
    ctaPrimary: '下载 macOS 版',
    ctaSecondary: '在 GitHub 上查看',
    ctaAll: '全部版本',
    metaOs: 'macOS 15 或更高',
    metaArch: 'Universal · Apple 芯片与 Intel',
    metaNative: '原生 Swift · 不联网 · 无遥测',
    disclaimer: '独立项目，与 Apple 无隶属关系。',
  },

  playground: {
    eyebrow: '试一试',
    title: '把菜单栏上那个图标，调成你想要的样子。',
    desc: '下面这些选项和 App 设置里的一模一样。拖动或点击，上面菜单栏里的图标会立刻跟着变。',
    previewBarLabel: '菜单栏实际尺寸',
    previewBarCaption: '它平时就这么小。',
    battery: '电池',
    batteryLevel: '电量',
    lowPower: '低电量模式',
    charging: '正在充电',
    showValue: '显示电量数字',
    wifi: 'Wi-Fi',
    wifiSignal: '信号',
    wifiState: '连接状态',
    volume: '音量',
    none: '无',
    muted: '静音',
    level: '格',
    lowPowerNote: '电量低于 20% 时优先显示红色。',
  },

  wifiState: {
    connected: '已连接',
    notAssociated: 'Wi-Fi 已开，未连接',
    off: 'Wi-Fi 关闭或不可用',
    noInternet: '无互联网',
    hotspot: '使用 iPhone 热点',
    temporary: '临时 Wi-Fi 连接',
    shared: '正在共享互联网',
  } satisfies Record<WifiStateKey, string>,

  features: {
    eyebrow: '功能',
    title: '不多不少，就做这几件事。',
    items: [
      {
        icon: 'combo',
        title: '三合一图标',
        desc: '电池、Wi-Fi、音量只占菜单栏一个位置，不用在一排图标里找。',
      },
      {
        icon: 'size',
        title: '大小随你调',
        desc: '20 到 32 pt 之间任选，默认 28 pt，宽一点窄一点自己拿捏。',
      },
      {
        icon: 'battery',
        title: '电池状态一眼看清',
        desc: '电量百分比、充电闪电、还有多久充满、低电量模式，点一下直达电池设置。',
      },
      {
        icon: 'wifi',
        title: 'Wi-Fi 状态不用猜',
        desc: '信号强弱、当前网络名字、常见的几种连接状态都能显示。',
      },
      {
        icon: 'volume',
        title: '音量也顺手看一眼',
        desc: '输出音量和静音状态都在，弹层里可以直接调。',
      },
      {
        icon: 'click',
        title: '原生的 macOS 手感',
        desc: '左键打开状态弹层，右键出标准菜单，和系统自带的一样顺手。',
      },
      {
        icon: 'bolt',
        title: '安静地更新',
        desc: '状态变了才刷新，另有低频兜底。不需要网络权限，也没有后台小动作。',
      },
      {
        icon: 'globe',
        title: '十二种语言',
        desc: '默认跟随系统语言，也可以手动挑一个，改完立刻生效。',
      },
      {
        icon: 'login',
        title: '登录时自动启动',
        desc: '开机就守在菜单栏；需要你在系统设置里批准时，它会告诉你。',
      },
    ] satisfies FeatureItem[],
  },

  privacy: {
    eyebrow: '隐私',
    title: '只用公开框架读状态，仅此而已。',
    items: [
      '不使用 App Sandbox，也不需要网络权限。',
      '没有遥测，没有统计，任何数据都不往外发。',
      '定位权限是可选的，只在你选择显示当前 Wi-Fi 网络名字时才会请求。',
    ],
  },

  requirements: {
    eyebrow: '开始使用',
    title: '系统要求',
    items: [
      'macOS 15 或更高版本',
      'Universal 通用二进制，Apple 芯片与 Intel 都能跑',
      '从源码运行需要 Swift 6 工具链（Xcode 16 或更高版本）',
    ],
    sourceHint: '想自己编译？',
    sourceCmd: 'git clone https://github.com/lingyired/status-trio && swift run StatusTrio',
    cta: '下载 Status Trio',
    ctaSub: 'DMG 安装包',
  },

  /** 排障：安装后打不开。`**粗体**` 与 `` `行内代码` `` 会在渲染时解析。 */
  troubleshoot: {
    eyebrow: '安装后打不开？',
    title: '放行一次，之后就正常了。',
    desc: 'Status Trio 没有 Apple 开发者签名，所以首次打开会被 macOS 拦一下。下面两种情况照着做就好，都不用重新下载。',
    navHint: '装好了却打不开？',
    copy: '复制',
    copied: '已复制',
    stepsLabel: '放行步骤',
    gatekeeper: {
      title: '提示「已损坏」或「无法验证开发者」？',
      body: '这是 macOS 对未经 Apple 公证的应用（Gatekeeper）的保护，**文件并没有损坏**。按下面几步放行即可。',
      warn: '⚠️ 不要点「移到废纸篓」—— 那样得重新下载，再把这套步骤走一遍。',
      steps: [
        '打开 **系统设置 → 隐私与安全性**，下滑到最底部的「安全性」区域。',
        '在「已阻止使用 Status Trio…」提示旁，点击 **仍要打开**。',
        '输入开机密码，然后重新打开 Status Trio，就正常了。',
      ],
      cmdIntro:
        '如果没看到「仍要打开」，或者放行后还是打不开，可以用一行命令去掉隔离标记（`com.apple.quarantine`）——打开「终端」，粘贴下面命令回车，再打开 Status Trio。',
      cmd: 'xattr -rd com.apple.quarantine "/Applications/Status Trio.app"',
      cmdNote: '如果装到了别的位置，把命令里的路径换成实际的 `…/Status Trio.app`。',
    },
    menubar: {
      title: '打开后好像什么都没发生？',
      paras: [
        '这是正常的 —— Status Trio 是**纯菜单栏应用**，没有窗口，也没有 Dock 图标。打开之后请往屏幕右上角看。',
        '图标就在菜单栏右侧、控制中心左边。如果没看到，可能是被刘海挡住或被太多图标挤了出去：按住 **⌘** 拖动图标，就能把它挪到看得见的位置。',
        '想确认它在不在跑：左键点一下会出状态弹层，右键会出系统菜单 —— 出得来就说明它好着呢。',
      ],
    },
  },

  footer: {
    note: '独立项目，与 Apple 无隶属关系。',
    madeBy: '由 lingyired 制作维护',
    links: {
      repo: 'GitHub',
      releases: '更新日志',
      site: 'lingai.net',
    },
  },
}

export type Copy = typeof zh

const en: Copy = {
  html: {
    title: 'Status Trio · Three system signals, one menu bar icon',
    description:
      'Status Trio combines Wi-Fi, battery, and volume into a single menu bar icon. A native Swift utility for macOS — no network access, no telemetry.',
  },
  menu: ['File', 'Edit', 'View', 'Window', 'Help'],
  langLabel: 'Language',
  themeLabel: 'Toggle light or dark appearance',
  appLabel: 'Status Trio menu bar icon',
  appHint: 'Click to try it',

  hero: {
    eyebrow: 'A macOS menu bar utility',
    title: 'Three system signals. One menu bar icon.',
    desc: 'Wi-Fi, battery, and volume used to live in three different corners of the menu bar. Now they share one compact icon — inspired by the iPhone Duo\u2019s combined status bar, rebuilt for the Mac.',
    ctaPrimary: 'Download for macOS',
    ctaSecondary: 'View on GitHub',
    ctaAll: 'All releases',
    metaOs: 'macOS 15 or later',
    metaArch: 'Universal · Apple silicon and Intel',
    metaNative: 'Native Swift · No network · No telemetry',
    disclaimer: 'Status Trio is an independent project and is not affiliated with Apple.',
  },

  playground: {
    eyebrow: 'Try it',
    title: 'Shape the icon that sits in your menu bar.',
    desc: 'These are the same options you get in the app\u2019s settings. Drag or click, and the icon in the menu bar above updates right away.',
    previewBarLabel: 'Actual menu bar size',
    previewBarCaption: 'That is how small it really is.',
    battery: 'Battery',
    batteryLevel: 'Level',
    lowPower: 'Low Power Mode',
    charging: 'Charging',
    showValue: 'Show percentage',
    wifi: 'Wi-Fi',
    wifiSignal: 'Signal',
    wifiState: 'Connection',
    volume: 'Volume',
    none: 'None',
    muted: 'Muted',
    level: 'bars',
    lowPowerNote: 'Below 20% the arc turns red first.',
  },

  wifiState: {
    connected: 'Connected',
    notAssociated: 'Wi-Fi on, not connected',
    off: 'Wi-Fi off or unavailable',
    noInternet: 'No internet',
    hotspot: 'Using iPhone hotspot',
    temporary: 'Temporary Wi-Fi connection',
    shared: 'Sharing internet',
  },

  features: {
    eyebrow: 'Features',
    title: 'It does a few things, and only well.',
    items: [
      {
        icon: 'combo',
        title: 'One combined icon',
        desc: 'Battery, Wi-Fi, and volume share a single menu bar slot — nothing to hunt for.',
      },
      {
        icon: 'size',
        title: 'Configurable size',
        desc: 'Anywhere from 20 to 32 pt, with 28 pt as the default. Go wider or narrower as you like.',
      },
      {
        icon: 'battery',
        title: 'Battery at a glance',
        desc: 'Percentage, charging bolt, time to full, Low Power Mode — with a shortcut into Battery Settings.',
      },
      {
        icon: 'wifi',
        title: 'Wi-Fi you can read',
        desc: 'Signal strength, the current network name, and the connection states that actually happen.',
      },
      {
        icon: 'volume',
        title: 'Volume, one look away',
        desc: 'Output level and mute state, both visible — and adjustable from the popover.',
      },
      {
        icon: 'click',
        title: 'Native macOS behaviour',
        desc: 'Left-click for the status popover, right-click for the standard menu. Just like the system.',
      },
      {
        icon: 'bolt',
        title: 'Quiet updates',
        desc: 'It refreshes when something changes, with a low-frequency fallback. No network access, no background chatter.',
      },
      {
        icon: 'globe',
        title: 'Twelve languages',
        desc: 'Follows your system language, or pick one yourself — changes apply immediately.',
      },
      {
        icon: 'login',
        title: 'Launch at login',
        desc: 'Be waiting in the menu bar after a restart, with guidance when macOS needs your approval.',
      },
    ],
  },

  privacy: {
    eyebrow: 'Privacy',
    title: 'It reads status through public frameworks. That is all.',
    items: [
      'No App Sandbox and no network entitlement.',
      'No telemetry, no analytics, and nothing sent anywhere.',
      'Location access is optional and requested only when you choose to show the current Wi-Fi network name.',
    ],
  },

  requirements: {
    eyebrow: 'Get started',
    title: 'Requirements',
    items: [
      'macOS 15 or later',
      'Universal binary — Apple silicon and Intel both work',
      'Swift 6 toolchain (Xcode 16 or later) to build from source',
    ],
    sourceHint: 'Prefer to build it yourself?',
    sourceCmd: 'git clone https://github.com/lingyired/status-trio && swift run StatusTrio',
    cta: 'Download Status Trio',
    ctaSub: 'DMG installer',
  },

  troubleshoot: {
    eyebrow: 'Troubleshooting',
    title: 'Allow it once, and that is the end of it.',
    desc: 'Status Trio carries no Apple developer signature, so macOS stops it the first time you open it. Either case below takes a moment to get past — no need to download again.',
    navHint: 'Installed, but it will not open?',
    copy: 'Copy',
    copied: 'Copied',
    stepsLabel: 'Steps',
    gatekeeper: {
      title: 'Seeing “damaged” or “cannot verify the developer”?',
      body: 'That is Gatekeeper protecting you from apps Apple has not notarized — **the file is not actually damaged**. Just allow it, as below.',
      warn: '⚠️ Do not click “Move to Trash” — you would have to download it again and repeat every step.',
      steps: [
        'Open **System Settings → Privacy & Security** and scroll to the “Security” section at the bottom.',
        'Next to the notice that Status Trio was blocked, click **Open Anyway**.',
        'Enter your login password, then open Status Trio again — that is it.',
      ],
      cmdIntro:
        'If “Open Anyway” never shows up, or it still refuses to launch, clear the quarantine flag (`com.apple.quarantine`) with a single command: open Terminal, paste the line below, press Return, then open Status Trio.',
      cmd: 'xattr -rd com.apple.quarantine "/Applications/Status Trio.app"',
      cmdNote: 'Installed it somewhere else? Swap the path for the real location of `…/Status Trio.app`.',
    },
    menubar: {
      title: 'It opened, but nothing seemed to happen?',
      paras: [
        'That is expected — Status Trio is a **menu bar-only app**. There is no window and no Dock icon. Look at the top-right corner of your screen.',
        'The icon sits on the right side of the menu bar, just left of Control Center. If you cannot spot it, the notch may be covering it or too many other items pushed it aside: hold **⌘** and drag it somewhere visible.',
        'To check whether it is running: left-click for the status popover, right-click for the standard menu. If those appear, it is alive and well.',
      ],
    },
  },

  footer: {
    note: 'Status Trio is an independent project and is not affiliated with Apple.',
    madeBy: 'Created and maintained by lingyired',
    links: {
      repo: 'GitHub',
      releases: 'Changelog',
      site: 'lingai.net',
    },
  },
}

export const COPY: Record<Lang, Copy> = { zh, en }

export const WIFI_STATE_ORDER: WifiStateKey[] = [
  'connected',
  'notAssociated',
  'off',
  'noInternet',
  'hotspot',
  'temporary',
  'shared',
]
