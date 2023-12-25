<script setup lang='ts'>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
</script>

<template>
</template>

<style scoped>
</style>
