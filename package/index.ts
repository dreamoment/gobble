import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { v4 as uuidv4 } from 'uuid'


interface CacheNumber<T> {
    [key: string]: T | undefined
}

enum TypeUpdate {
    matrix = 0,
    visible = 0,
}


class CacheManager<T> {

    cache: CacheNumber<T> = {}

    get(uuid: string) {
        return this.cache[uuid]
    }

    set(uuid: string, value: T) {
        this.cache[uuid] = value
    }

    // delete(uuid: string) {
    //     delete this.cache[uuid]
    // }
}


class Gobble {

    readonly uuid: string
    mesh: THREE.Mesh

    constructor(mesh: THREE.Mesh) {
        this.uuid = uuidv4()
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
                    const clone = e.geometry.clone()
                    clone.applyMatrix4(e.matrix)
                    geometries.push(clone)
                }
            })
        })
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
        const mesh = new THREE.Mesh(mergedGeometry, material)
        super(mesh)
    }
}


class GPUInstancingObject3D {

    readonly uuid: string = uuidv4()
    type: number = 0
    parent: GPUInstancingSingle | GPUInstancingMultiple
    visible: boolean = true
    active: boolean = false
    position: THREE.Vector3 = new THREE.Vector3()
    rotation: THREE.Euler = new THREE.Euler()
    scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
    matrix: THREE.Matrix4 = new THREE.Matrix4()

    constructor(parent: GPUInstancingSingle | GPUInstancingMultiple) {
        this.parent = parent
    }

    _switchActive(active: boolean) {
        this.active = active
    }

    getPosition() {
        return this.position
    }

    setPosition(position: THREE.Vector3) {
        this.position.copy(position)
        this.parent._update(TypeUpdate.matrix, this)
    }

    getRotation() {
        return this.rotation
    }

    setRotation(rotation: THREE.Euler) {
        this.rotation.copy(rotation)
        this.parent._update(TypeUpdate.matrix, this)
    }

    getScale() {
        return this.scale
    }

    setScale(scale: THREE.Vector3) {
        this.scale.copy(scale)
        this.parent._update(TypeUpdate.matrix, this)
    }

    getVisible() {
        return this.visible
    }

    setVisible(visible: boolean) {
        this.visible = visible
        this.parent._update(TypeUpdate.visible, this)
    }
}

class GPUInstancingSingle extends Gobble {

    declare mesh: THREE.InstancedMesh
    indexAdd: number = 0
    cacheIndex: CacheManager<number> = new CacheManager<number>()

    constructor(geometry: THREE.BufferGeometry, material: THREE.Material, total: number) {
        const mesh = new THREE.InstancedMesh(geometry, material, total)
        super(mesh)
    }

    _update(type: TypeUpdate, object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) === 'number') {
            switch (type) {
                case TypeUpdate.matrix:
                case TypeUpdate.visible:
                    this._updateMatrix(object3D)
                    break
            }
        }
    }

    _updateMatrix(object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) === 'number') {
            const matrix = object3D.matrix
            let scale
            if (object3D.active) {
                if (object3D.visible) {
                    scale = object3D.scale
                }
                else {
                    scale = new THREE.Vector3(0, 0, 0)
                }
            }
            else {
                scale = new THREE.Vector3(0, 0, 0)
            }
            matrix.compose(
                object3D.position,
                new THREE.Quaternion().setFromEuler(object3D.rotation),
                scale
            )
            this.mesh.setMatrixAt(index, matrix)
            this.mesh.instanceMatrix.needsUpdate = true
        }
    }

    create() {
        return new GPUInstancingObject3D(this)
    }

    add(object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) !== 'number') {
            this.cacheIndex.set(object3D.uuid, this.indexAdd)
            this.indexAdd++
        }
        object3D._switchActive(true)
        this._updateMatrix(object3D)
        return this
    }

    remove(object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) === 'number') {
            object3D._switchActive(false)
            this._updateMatrix(object3D)
            // this.cacheIndex.delete(object3D.uuid)
        }
        return this
    }
}


class GPUInstancingMultiple extends Gobble {

    declare mesh: THREE.BatchedMesh
    geometries: THREE.BufferGeometry[]
    cacheIndex: CacheManager<number> = new CacheManager<number>()

    constructor(geometries: THREE.BufferGeometry[], material: THREE.Material, total: number) {
        const indexCount: number[] = []
        const vertexCount: number[] = []
        geometries.forEach(geometry => {
            if (geometry.index) {
                indexCount.push(geometry.index.count)
            }
            vertexCount.push(geometry.attributes.position.count)
        })
        const maxIndexCount = Math.max(...indexCount)
        const maxVertexCount = Math.max(...vertexCount)
        const mesh = new THREE.BatchedMesh(total, total * maxVertexCount, total * maxIndexCount, material)
        super(mesh)
        this.geometries = geometries
    }

    _update(type: TypeUpdate, object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) === 'number') {
            switch (type) {
                case TypeUpdate.matrix:
                    this._updateMatrix(object3D)
                    break
                case TypeUpdate.visible:
                    this._updateVisible(object3D)
                    break
            }
        }
    }

    _updateMatrix(object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) === 'number') {
            const matrix = object3D.matrix
            matrix.compose(
                object3D.position,
                new THREE.Quaternion().setFromEuler(object3D.rotation),
                object3D.active ? object3D.scale : new THREE.Vector3(0, 0, 0)
            )
            this.mesh.setMatrixAt(index, matrix)
        }
    }

    _updateVisible(object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) === 'number') {
            this.mesh.setVisibleAt(index, object3D.visible)
        }
    }

    create(type: number) {
        const object3D = new GPUInstancingObject3D(this)
        object3D.type = type
        return object3D
    }

    add(object3D: GPUInstancingObject3D) {
        const type = object3D.type
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) !== 'number') {
            const index0 = this.mesh.addGeometry(this.geometries[type])
            this.cacheIndex.set(object3D.uuid, index0)
        }
        object3D._switchActive(true)
        this._updateMatrix(object3D)
        return this
    }

    remove(object3D: GPUInstancingObject3D) {
        const index = this.cacheIndex.get(object3D.uuid)
        if (typeof(index) === 'number') {
            object3D._switchActive(false)
            this._updateMatrix(object3D)

            // this.mesh.deleteGeometry(index)
            // this.cacheIndex.delete(object3D.uuid)
        }
        return this
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