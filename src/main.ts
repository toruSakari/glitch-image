

import GlitchImage from '@/classes/GlitchImage'


/**
 * カスタムエレメントの生成
 * <glitch-svg />
 */
class GlitchImageComponent extends HTMLElement {
  private _glitchImage: GlitchImage | null
  private _src: string
  private _disabledNoise: boolean
  private _auto: boolean
  private _background: string

  constructor() {
    super()
    this._glitchImage = null

    this._src = this.getAttribute('src') || ''
    this._disabledNoise = this.getAttribute('disabled-noise') !== null
    this._auto = this.getAttribute('auto') !== null
    this._background = this.getAttribute('background') || ''
    this.initialized()
  }
  /**
   * 初期化の処理
   */
  private initialized() {
    const canvas = document.createElement('canvas')
    this.attachShadow({ mode: 'open' })
    this._glitchImage = new GlitchImage({
      canvas,
      src: this._src,
      disabledNoise: this._disabledNoise,
      auto: this._auto,
      background: this._background,
    })
    this.shadowRoot?.append(canvas)
    this._glitchImage.initialized()
  }
}

//カスタム要素の生成
customElements.define("glitch-image", GlitchImageComponent)
