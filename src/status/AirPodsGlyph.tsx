import React from 'react'
import airpodsMaskUrl from '../assets/airpods-mask.png'

const AIRPODS_MASK_ASPECT_RATIO = 473 / 512

interface AirPodsGlyphProps {
  x: number
  y: number
  width: number
  fill?: string
  className?: string
}

/** Native SF Symbol "airpods" exported as an alpha mask, tinted by currentColor. */
export function AirPodsGlyph({
  x,
  y,
  width,
  fill = 'currentColor',
  className,
}: AirPodsGlyphProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const maskId = `airpods-mask-${uid}`
  const height = width * AIRPODS_MASK_ASPECT_RATIO

  return (
    <g
      className={className}
      data-symbol="airpods"
      aria-hidden="true"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={x}
          y={y}
          width={width}
          height={height}
          style={{ maskType: 'alpha' } as React.CSSProperties}
        >
          <image
            href={airpodsMaskUrl}
            x={x}
            y={y}
            width={width}
            height={height}
            preserveAspectRatio="none"
          />
        </mask>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        mask={`url(#${maskId})`}
      />
    </g>
  )
}
