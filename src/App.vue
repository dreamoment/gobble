<script setup lang='ts'>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { StaticBatching, GPUInstancing } from '../package/index'


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 )
const ambientLight = new THREE.AmbientLight(0xffffff)
const directionalLight = new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1, 1, 1)
scene.add(ambientLight, directionalLight)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const stats = new Stats()
document.body.appendChild(stats.dom)

const controls = new OrbitControls(camera, renderer.domElement)

camera.position.set(150, 150, 150)


const Method = {
  StaticBatching: 'StaticBatching',
  GPUInstancingSingle: 'GPUInstancingSingle',
  GPUInstancingMultiple: 'GPUInstancingMultiple',
  Native: 'Native'
}

const params = {
  method: Method.Native,
  count: 20
}

const store = {
  StaticBatching: new THREE.Group(),
  GPUInstancingSingle: new THREE.Group(),
  GPUInstancingMultiple: new THREE.Group(),
  Native: new THREE.Group()
}

const distance = 3
const total = Math.pow(params.count, 3)

const spheres = new THREE.Group()
scene.add(spheres)
const sphereGeometry = new THREE.SphereGeometry(1.0, 16, 8)
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 16)
const commonMaterial = new THREE.MeshStandardMaterial()

const generateMesh = () => {
  spheres.clear()

  const handler = {
    StaticBatching: () => {
      if (store.StaticBatching.children.length === 0) {
        const staticBatching = new StaticBatching(store.Native.children, commonMaterial)
        const mesh = staticBatching.getMesh()
        store.StaticBatching.add(mesh)
      }
      spheres.add(store.StaticBatching)
    },
    GPUInstancingSingle: () => {
      if (store.GPUInstancingSingle.children.length === 0) {
        const instancingSingle = new GPUInstancing.Single(sphereGeometry, commonMaterial, total)
        store.Native.children.forEach((child, index) => {
          const object3D = instancingSingle.create()
          object3D.setPosition(child.position)
          object3D.setRotation(child.rotation)
          object3D.setScale(child.scale)
          instancingSingle.add(object3D)
        })
        const mesh = instancingSingle.getMesh()
        store.GPUInstancingSingle.add(mesh)
      }
      spheres.add(store.GPUInstancingSingle)
    },
    GPUInstancingMultiple: () => {
      if (store.GPUInstancingMultiple.children.length === 0) {
        const instancingMultiple = new GPUInstancing.Multiple([sphereGeometry, cylinderGeometry], commonMaterial, total)
        store.Native.children.forEach((child, index) => {
          const type = (index % 2) ? 0 : 1
          const object3D = instancingMultiple.create(type)
          object3D.setPosition(child.position)
          object3D.setRotation(child.rotation)
          object3D.setScale(child.scale)
          instancingMultiple.add(object3D)
        })
        const mesh = instancingMultiple.getMesh()
        store.GPUInstancingMultiple.add(mesh)
      }
      spheres.add(store.GPUInstancingMultiple)
    },
    Native: () => {
      if (store.Native.children.length === 0) {
        const sphereMeshes = []
        for (let a = 0; a < params.count; a++) {
          for (let b = 0; b < params.count; b++) {
            for (let c = 0; c < params.count; c++) {
              const geometry = sphereGeometry.clone()
              const material = commonMaterial.clone()
              const sphereMesh = new THREE.Mesh(geometry, material)

              const matrix = new THREE.Matrix4()
              matrix.compose(
                  new THREE.Vector3(a * distance, b * distance, c * distance),
                  new THREE.Quaternion(),
                  new THREE.Vector3(1, 1, 1)
              )
              sphereMesh.applyMatrix4(matrix)
              sphereMeshes.push(sphereMesh)
            }
          }
        }
        store.Native.add(...sphereMeshes)
      }
      spheres.add(store.Native)
    }
  }

  switch (params.method) {
    case Method.StaticBatching:
      handler.StaticBatching()
      break
    case Method.GPUInstancingSingle:
      handler.GPUInstancingSingle()
      break
    case Method.GPUInstancingMultiple:
      handler.GPUInstancingMultiple()
      break
    case Method.Native:
      handler.Native()
      break
  }
}

const gui = new GUI()
gui.add(params, 'method', Method)
gui.onFinishChange((payload: any) => {
  if (payload.property === 'method') {
    switch (payload.value) {
      case Method.StaticBatching:
        generateMesh()
        break
      case Method.GPUInstancingSingle:
        generateMesh()
        break
      case Method.GPUInstancingMultiple:
        generateMesh()
        break
      case Method.Native:
        generateMesh()
        break
    }
  }
})

const animate = () => {
  stats.begin()
  controls.update()
  renderer.render(scene, camera)
  stats.end()
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

generateMesh()

renderer.setAnimationLoop(animate)
</script>

<template>
</template>

<style scoped>
</style>
