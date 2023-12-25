<h1 align="center">gobble</h1>

![](/docs/preview.gif)

语言: [English](README.md) | 中文简体

## gobble 是什么 ?

双面纹理材质。

> 请确保`threejs`版本大于`r118`，否则会出现因`glsl`版本过低，导致着色器代码报错。

## 特性

- 轻量易用

- 基于`threejs`原生材质

- 支持`typescript`

## 安装

```agsl
npm i @dreamoment/gobble
```

## 示例

```
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import TwoSidedMaterial from '@dreamoment/gobble'


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 )
const ambientLight = new THREE.AmbientLight(0xffffff)
const directionalLight = new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1, 1, 1)
scene.add(ambientLight, directionalLight)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

camera.position.z += 5


let textureLoader = new THREE.TextureLoader()
const textureFront = textureLoader.load('./images/red.png')
const textureBack = textureLoader.load('./images/blue.png')

const twoSidedMaterial = new TwoSidedMaterial(new THREE.MeshStandardMaterial())
twoSidedMaterial.setTextureFront(textureFront)
twoSidedMaterial.setTextureBack(textureBack)

// or
// twoSidedMaterial.setTextures(textureFront, textureBack)

const material = twoSidedMaterial.getMaterial()
const plane = new THREE.Mesh(new THREE.PlaneGeometry(), material)
scene.add( plane )

const animate = () => {
  controls.update()
  renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

renderer.setAnimationLoop(animate)
```

## API

```
type MaterialEnabled = THREE.LineBasicMaterial |
    THREE.MeshBasicMaterial |
    THREE.MeshDepthMaterial |
    THREE.MeshDistanceMaterial |
    THREE.MeshLambertMaterial |
    THREE.MeshMatcapMaterial |
    THREE.MeshPhongMaterial |
    THREE.MeshPhysicalMaterial |
    THREE.MeshStandardMaterial |
    THREE.MeshToonMaterial |
    THREE.PointsMaterial |
    THREE.SpriteMaterial

new TwoSidedMaterial(material: MaterialEnabled)
```

### getMaterial

获取 `threejs` 材质实例。

```
getMaterial(): MaterialEnabled
```

### setTextureFront

设置材质正面的纹理。

```
setTextureFront(texture: THREE.Texture): void
```

### setTextureBack

设置材质反面的纹理。

```
setTextureBack(texture: THREE.Texture): void
```

### setTextures

设置材质正面、反面的纹理。

```
setTextures(textureFront: THREE.Texture, textureBack: THREE.Texture): void
```