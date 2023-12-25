<h1 align="center">gobble</h1>

![](/docs/preview.gif)

Language: English | [中文简体](README_zh_cn.md)

## What is gobble ?

Two-sided texture material.

> Make sure that the version of `threejs` is greater than `r118`, otherwise the shader code will error because the version of `glsl` is too low.

## Features

- lightweight and easy to use

- based on `threejs` native material

- support `typescript`

## Install

```agsl
npm i @dreamoment/gobble
```

## Examples

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

Gets the `threejs` material instance.

```
getMaterial(): MaterialEnabled
```

### setTextureFront

Set the texture for the front of the material.

```
setTextureFront(texture: THREE.Texture): void
```

### setTextureBack

Set the texture on the opposite side of the material.

```
setTextureBack(texture: THREE.Texture): void
```

### setTextures

Set the textures for the front and back of the material.

```
setTextures(textureFront: THREE.Texture, textureBack: THREE.Texture): void
```
