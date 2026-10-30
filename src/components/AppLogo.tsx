import type { CSSProperties } from 'react'
import appIconLight from '../assets/app-icon/AppIcon-light.png'
import appIconDark from '../assets/app-icon/AppIcon-dark.png'

interface AppLogoProps {
  size: number
  className?: string
}

/** Exact native app artwork, switched by the landing page's root theme. */
export function AppLogo({ size, className }: AppLogoProps) {
  return (
    <span
      className={'app-logo' + (className ? ` ${className}` : '')}
      style={{ width: size, height: size } as CSSProperties}
      aria-hidden="true"
    >
      <img
        data-app-logo="light"
        src={appIconLight}
        width={size}
        height={size}
        alt=""
        draggable={false}
      />
      <img
        data-app-logo="dark"
        src={appIconDark}
        width={size}
        height={size}
        alt=""
        draggable={false}
      />
    </span>
  )
}
