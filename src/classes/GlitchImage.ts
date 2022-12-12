
type GlitchImageTypes = {
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

type GlitchImageProps = Pick<
  GlitchImageTypes,
  'canvas' | 'src' | 'disabledNoise' | 'auto' | 'background'
  >

const defaultColorOption = {
  rOffset: 0,
  bOffset: 0,
  gOffset: 0
}

export default class GlitchImage {
  private _canvas: GlitchImageTypes['canvas']
  private _src: GlitchImageTypes['src']
  private _auto: GlitchImageTypes['auto']
  private _noise: GlitchImageTypes['noise']
  private _background: GlitchImageTypes['background']
  private _ctx: GlitchImageTypes['ctx']
  private _img: GlitchImageTypes['img']
  private _prevTime: GlitchImageTypes['prevTime']
  private _glitchLinePos: GlitchImageTypes['glitchLinePos']

  constructor({ canvas, src, disabledNoise = false, auto = false, background = '#1a191c' }: GlitchImageProps) {
    this._canvas = canvas
    this._src = src
    //親要素の幅に合わせる。
    this._auto = auto
    this._noise = disabledNoise
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D
    this._background = background
    this._img = null
    this._prevTime = 0
    this._glitchLinePos = this.setGlitchLinePos()
  }

  private loadImg(src: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = src
    })
  }

  private fetchSvg(): Promise<HTMLElement> {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', this._src)
      xhr.responseType = 'document'
      xhr.onload = () => {
        if (!(xhr.responseXML instanceof Document)) {
          throw Error()
        }
        resolve(xhr.responseXML.documentElement)
      };
      xhr.send();
    })
  }
/**
 * svgファイルの読み込み
 */
  private loadSvg(svgDoc: HTMLElement): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => resolve(img)
      const str = new XMLSerializer().serializeToString(svgDoc)
      img.src = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(str))) }`
    })
  }

  /**
   * ファイルの拡張子を取得
   */
  private getExtension(filename: string): string {
    const extension = filename.split('.').pop()
    if (typeof extension !== 'string') {
      throw new Error('extension is string but undefined')
    }
    return extension
  }

  /**
   * 画像のrgbの値を変更した画像を返す。
   */
  private createRgbImage(x: number, y: number, options:typeof defaultColorOption = defaultColorOption) {
    const { rOffset, gOffset, bOffset } = options
    const canvas = this._canvas
    const ctx = this._ctx

    ctx.drawImage(this._img!!, x, y, canvas.width, canvas.height)
    const originalArray = ctx.getImageData(x, y, canvas.width, canvas.height).data
    const newArray = new Uint8ClampedArray(originalArray);

    for (let i = 0; i < originalArray.length; i += 4) {
      newArray[i + 0 + rOffset * 4] = originalArray[i + 0]
      newArray[i + 1 + gOffset * 4] = originalArray[i + 1]
      newArray[i + 2 + bOffset * 4] = originalArray[i + 2]
    }

    return new ImageData(newArray, canvas.width, canvas.height)
  }

  /**
   * 初期化
   */
  async initialized() {
    const extension = this.getExtension(this._src)
    if (extension === 'svg') {
      const svgDoc = await this.fetchSvg()
      this._img = await this.loadSvg(svgDoc)
    } else {
      this._img = await this.loadImg(this._src)
    }

    this.rect()
  }

  /**
   * canvasのサイズの指定
   */
  private setCanvasSize = () => {
    const _img = this._img!!

    if (this._auto) {
      const canvasParentElement = this._canvas.parentElement?.parentElement
      if (!(canvasParentElement instanceof HTMLElement)) {
        throw Error('parent element is not defined')
      }
      this._canvas.width = canvasParentElement.clientWidth
      this._canvas.height = canvasParentElement.clientWidth * (_img.height / _img.width)
    } else {
      this._canvas.width = _img.width
      this._canvas.height = _img.height
    }
  }

  /**
   * canvasの描画
   */
  private rect(callback: number = 0) {

    this.setCanvasSize()
    const glitchLineSecond = 200

    this._ctx.fillStyle = this._background
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height)

    if (Math.round(callback) % glitchLineSecond < this._prevTime % glitchLineSecond) {
      this._glitchLinePos = this.setGlitchLinePos()
    }

    const r1 = this.createRgbImage(0, 0, {
      rOffset: this._glitchLinePos.x + 5,
      gOffset: this._glitchLinePos.x * -1,
      bOffset: this._glitchLinePos.x
    })

    // レンタリングした画像に置き換え
    this._ctx.putImageData(r1, 0, 0)

    // ノイズの処理
    if (this._noise) {
      const noiseCount = Math.floor(Math.random() * (this._canvas.height / 10))
      for (let i = 0; i < noiseCount; i++) {
        this.createNoise(this._canvas.width * Math.random(), this._canvas.height * Math.random())
      }
    }

    if (Math.round(callback) % glitchLineSecond <= glitchLineSecond) {
      const barCount = Math.floor(Math.random() * this._canvas.height)
      for (let i = 0; i < barCount; i++) {
        this.createGlitchLine(this._glitchLinePos.x, i * this._glitchLinePos.y)
      }
    }

    this._prevTime = callback
    requestAnimationFrame(this.rect.bind(this))
  }

  createNoise(x: number, y:number) {
    const ctx = this._ctx
    const noise =
      ctx.createImageData(Math.ceil(Math.random() * Math.floor(this._canvas.width / 15)), 1);

    for (let i = 0; i < noise.data.length; i += 4) {
      noise.data[i + 0] = Math.floor(Math.random() * 255)
      noise.data[i + 1] = Math.floor(Math.random() * 255)
      noise.data[i + 2] = Math.floor(Math.random() * 255)
      noise.data[i + 3] = 255;
    }

    ctx.putImageData(noise, x, y)
  }

  private setGlitchLinePos() {
    return {
      x: Math.random(),
      y: Math.floor(Math.random() * 5)
    }
  }

  private createGlitchLine(x: number, y: number) {
    const ctx = this._ctx
    let barHeight = 1
    let barShift = 10

    var imgData = ctx.getImageData(x, y, this._canvas.width * 1, barHeight);

    const rOffset = -barShift,
      gOffset = barShift,
      bOffset = barShift * 2;

    const arr = new Uint8ClampedArray(imgData.data);
    for (let i = 0; i < arr.length; i += 4) {
      arr[i + 0 + rOffset * 4] = imgData.data[i + 0];
      arr[i + 1 + gOffset * 4] = imgData.data[i + 1];
      arr[i + 2 + bOffset * 4] = imgData.data[i + 2];
    }

    const glitch = new ImageData(arr, imgData.width, imgData.height);
    ctx.putImageData(glitch, x, y);
  }

}
