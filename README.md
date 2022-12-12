# glitch-image
glitchエフェクトのカスタムエレメント
## サポートしている拡張子
- JPG 
- PNG 
- SVG

## 使用方法
1. 下記jsファイルを読み込む
```html
<script src="/dist/glitch-image.min.js" defer></script>
```
2. 下記タグを追加
```html
<glitch-image src="/img/sample.jpg">
```
### オプション一覧
| キー | 型 | 概要 |
| ---- | --- | --- |
| src            | string        | 対象画像へのパス |
| disabled-noise | boolean       | ノイズ処理の無効化 |
| auto           | boolean       | 画像サイズを親要素の領域の大きさに合わせるか |
| background     | string        | canvasの背景色 |
