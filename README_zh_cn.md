<h1 align="center">gobble</h1>

![](/docs/preview.gif)

语言: [English](README.md) | 中文简体

## gobble 是什么 ?

`threejs` 合批工具，集成了多种合批方案。

## 特性

- 轻量易用

- 支持静态合批、GPU实例化

- 支持`typescript`

## 应用场景
方法| 材质 | 几何体 | 可变换性 | 生成时间 | 渲染性能 |内存占用
:-:|:--:|:---:|:----:|:----:|:----:|:-:
静态合批| 单一 | 无限制 |  无   |  慢   |  优   |多
GPU单实例化| 单一 | 单一  |  有   |  快   |  良   |少
GPU多实例化| 单一 | 多个  |  有   |  快  |  良   |少

## 安装

```agsl
npm i @dreamoment/gobble
```

## 示例

```javascript
// StaticBatching
import * as THREE from 'three'
import { StaticBatching } from '@dreamoment/gobble'

const commonMaterial = new THREE.MeshStandardMaterial()

const staticBatching = new StaticBatching([group1, group2], commonMaterial, total)
const mesh = staticBatching.getMesh()
scene.add(mesh)
```

```javascript
import * as THREE from 'three'

const sphereGeometry = new THREE.SphereGeometry(1.0, 16, 8)
const commonMaterial = new THREE.MeshStandardMaterial()

const total = 100
const instancingSingle = new GPUInstancing.Single(sphereGeometry, commonMaterial, total)
// If you take the first child, do the same for the other 99
const object3D = instancingSingle.create()
object3D.setPosition(child.position)
object3D.setRotation(child.rotation)
object3D.setScale(child.scale)
instancingSingle.add(object3D)
```

```javascript
import * as THREE from 'three'
import { StaticBatching, GPUInstancing } from '@dreamoment/gobble'

const sphereGeometry = new THREE.SphereGeometry(1.0, 16, 8)
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 16)
const commonMaterial = new THREE.MeshStandardMaterial()

const total = 100
const instancingMultiple = new GPUInstancing.Multiple([sphereGeometry, c], commonMaterial, total)
// If you take the first child, do the same for the other 99
const object3D = instancingMultiple.create(0)       // base sphereGeometry
// const object3D = instancingMultiple.create(1)    // base cylinderGeometry
object3D.setPosition(child.position)
object3D.setRotation(child.rotation)
object3D.setScale(child.scale)
instancingMultiple.add(object3D)
```

## StaticBatching API

静态合批。

```
new StaticBatching(object3Ds: THREE.Object3D[], material?: THREE.Material)
```

### getMesh

获取处理后的网格。

```
getMesh(): THREE.Mesh
```

## GPUInstancing API

GPU 单实例化。

```
new GPUInstancing.Single(geometry: THREE.BufferGeometry, material: THREE.Material, total: number)
```

GPU 多实例化。

```
new GPUInstancing.Multiple(geometries: THREE.BufferGeometry[], material: THREE.Material, total: number)
```

### getMesh

获取处理后的网格。

```
getMesh(): THREE.Mesh
```

### create

生成子物体。

```
// from GPUInstancing.Single
create(): GPUInstancingObject3D
```

```
// from GPUInstancing.Multiple
create(type: number): GPUInstancingObject3D
```

### add

添加子物体。

```
add(object3D: GPUInstancingObject3D): GPUInstancingMultiple
```

### remove

移除子物体。

```
remove(object3D: GPUInstancingObject3D): GPUInstancingMultiple
```

## GPUInstancingObject3D API

GPU 实例化生成的子物体。

### getPosition / setPosition

获取/设置子物体的定位信息。

```
getPosition(): THREE.Vector3
setPosition(position: THREE.Vector3): void
```

### getRotation / setRotation

获取/设置子物体的旋转信息。

```
getRotation(): THREE.Euler
setRotation(rotation: THREE.Euler): void
```

### getScale / setScale

获取/设置子物体的缩放信息。

```
getScale(): THREE.Vector3
setScale(scale: THREE.Vector3): void
```

### getVisible / setVisible

获取/设置子物体的可见性。

```
getVisible(): boolean
setVisible(visible: boolean): void
```