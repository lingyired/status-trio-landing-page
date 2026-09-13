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

/** 功能列表只保留三个状态，各配一个图标 —— 这三张图标也是产品名里的「三态」。 */
export type FeatureIconKey = 'battery' | 'wifi' | 'volume'

export interface FeatureItem {
  icon: FeatureIconKey
  text: string
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
  appHint: '点一下开合设置面板',

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

  /** 浮动设置面板（挂在菜单栏正下方）里的三组选项 */
  settings: {
    hint: '和 App 里的设置一模一样。菜单栏上的图标会立刻跟着变；点一下菜单栏图标就能收起来。',
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
    lowPowerNote: '电量低于 20% 时优先显示红色。',
  },

  /** 菜单栏实际尺寸 + 放大预览（排在功能列表下面） */
  preview: {
    label: '菜单栏实际尺寸',
    caption: '它平时就这么小。',
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
        icon: 'battery',
        text: '电量、充没充电、低电量模式，一眼看清。',
      },
      {
        icon: 'wifi',
        text: '信号强弱、连的是哪个网络、通不通，都写着。',
      },
      {
        icon: 'volume',
        text: '输出音量和静音状态，弹层里顺手就能调。',
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
  appHint: 'Click to show or hide the settings',

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

  settings: {
    hint: 'The same options you get in the app. The menu bar icon follows along instantly — click that icon to tuck the panel away.',
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
    lowPowerNote: 'Below 20% the arc turns red first.',
  },

  preview: {
    label: 'Actual menu bar size',
    caption: 'That is how small it really is.',
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
        icon: 'battery',
        text: 'Percentage, charging, and Low Power Mode, all at a glance.',
      },
      {
        icon: 'wifi',
        text: 'Signal strength, the network you are on, and whether it reaches the internet.',
      },
      {
        icon: 'volume',
        text: 'Output level and mute state, adjustable right from the popover.',
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
