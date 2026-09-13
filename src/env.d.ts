/** 资源模块声明：Rsbuild 处理 CSS / 图片等资源导入，TS 侧仅声明存在性。 */
declare module '*.css'

declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.svg'
declare module '*.webp'

/** Rsbuild 构建期注入的环境变量（dev=false / build=true，静态替换）。 */
interface ImportMeta {
  readonly env: {
    readonly MODE: string
    readonly DEV: boolean
    readonly PROD: boolean
  }
}
