<h1 align="center">gobble</h1>

![](/docs/preview.gif)

Language: English | [中文简体](README_zh_cn.md)

## What is gobble ?

Two-sided texture material.

## Features

- lightweight and easy to use

- based on `threejs` native material

- support `typescript`

## Scenarios
method | material | geometry | transformability | generated time | rendering performance | memory usage
:-:|:--------:|:--------:|:----------------:|:--------------:|:---------------------:|:-:
Static Batching|    single    |   unlimited    |        no        |      slow      |        better         |high
GPU Instancing Single|    single    |  single  |       yes        |      fast      |         good          |low
GPU Instancing Multiple|    single    | multiple |        yes         |       fast        |         good          |low

## Install

```agsl
npm i @dreamoment/gobble
```

## Examples

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

Static batching.

```
new StaticBatching(object3Ds: THREE.Object3D[], material?: THREE.Material)
```

### getMesh

Get the processed mesh.

```
getMesh(): THREE.Mesh
```

## GPUInstancing API

GPU Instancing Single.

```
new GPUInstancing.Single(geometry: THREE.BufferGeometry, material: THREE.Material, total: number)
```

GPU Instancing Multiple.

```
new GPUInstancing.Multiple(geometries: THREE.BufferGeometry[], material: THREE.Material, total: number)
```

### getMesh

Get the processed mesh.

```
getMesh(): THREE.Mesh
```

### create

Generate a child object.

```
// from GPUInstancing.Single
create(): GPUInstancingObject3D
```

```
// from GPUInstancing.Multiple
create(type: number): GPUInstancingObject3D
```

### add

Add a child object.

```
add(object3D: GPUInstancingObject3D): GPUInstancingMultiple
```

### remove

Remove a child object.

```
remove(object3D: GPUInstancingObject3D): GPUInstancingMultiple
```

## GPUInstancingObject3D API

The child object that GPUInstancing generates.

### getPosition / setPosition

Get/set the position information of the child object.

```
getPosition(): THREE.Vector3
setPosition(position: THREE.Vector3): void
```

### getRotation / setRotation

Get/set the rotation information of the child object.

```
getRotation(): THREE.Euler
setRotation(rotation: THREE.Euler): void
```

### getScale / setScale

Get/set the scale information of the child object.

```
getScale(): THREE.Vector3
setScale(scale: THREE.Vector3): void
```

### getVisible / setVisible

Get/set the visible information of the child object.

```
getVisible(): boolean
setVisible(visible: boolean): void
```