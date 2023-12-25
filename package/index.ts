import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'


class Gobble {

    mesh: THREE.Mesh

    constructor(mesh: THREE.Mesh) {
        this.mesh = mesh
    }

    getMesh() {
        return this.mesh
    }
}

class StaticBatching extends Gobble {

    constructor(object3Ds: THREE.Object3D[], material?: THREE.Material) {
        const geometries: THREE.BufferGeometry[] = []
        object3Ds.forEach(object3D => {
            object3D.traverse(e => {
                if (e instanceof THREE.Mesh) {
                    e.geometry.applyMatrix4(e.matrix)
                    geometries.push(e.geometry)
                }
            })
        })
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
        const mesh = new THREE.Mesh(mergedGeometry, material)
        super(mesh)
    }
}


class GPUInstancingSingle extends Gobble {

    declare mesh: THREE.InstancedMesh

    constructor(geometry: THREE.BufferGeometry, material: THREE.Material, total: number) {
        const mesh = new THREE.InstancedMesh(geometry, material, total)
        super(mesh)
    }

    setInstance(index: number, matrix: THREE.Matrix4) {
        this.mesh.setMatrixAt(index, matrix)
    }
}


class GPUInstancingMultiple extends Gobble {

    declare mesh: THREE.BatchedMesh
    geometries: THREE.BufferGeometry[]

    constructor(geometries: THREE.BufferGeometry[], material: THREE.Material, total: number) {
        const mesh = new THREE.BatchedMesh(total, total * 512, total * 1024, material)
        super(mesh)
        this.geometries = geometries
    }

    setMesh(index: number, matrix: THREE.Matrix4) {
        const modelId = this.mesh.addGeometry(this.geometries[index])
        this.mesh.setMatrixAt(modelId, matrix)
    }
}


class GPUInstancing {

    static Single = GPUInstancingSingle
    static Multiple = GPUInstancingMultiple
}


export {
    StaticBatching,
    GPUInstancing,
}