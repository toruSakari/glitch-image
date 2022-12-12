export type GlitchImageTypes = {
  canvas: HTMLCanvasElement
  src: string
  disabledNoise: boolean
  auto: boolean
  noise: boolean
  background: string
  ctx: CanvasRenderingContext2D
  img: HTMLImageElement | null
  prevTime: number
  glitchLinePos: {
    x: number,
    y: number
  }
}

export type GlitchImageProps = Pick<
  GlitchImageTypes,
  'canvas' | 'src' | 'disabledNoise' | 'auto' | 'background'
>
