import { ReadonlyVec2, vec2 } from 'gl-matrix'

type NodeGeometryProps = {
    x?: number
    y?: number
    width: number
    height: number
}
/**
 * Interface for geometry of a Quadtree node
 */
export interface NodeGeometry {
    /**
     * X position of the node
     */
    x: number

    /**
     * Y position of the node
     */
    y: number

    /**
     * Width of the node
     */
    width: number

    /**
     * Height of the node
     */
    height: number

    /**
     * X,Y position vector of the node
     */
    readonly position: vec2

    /**
     * Width, Height size vector of the node
     */
    readonly size: vec2
    /**
     * X,Y position vector of the node
     */
    center(): Readonly<vec2>
    center(out: vec2): vec2
}

function toString(this: NodeGeometry): string {
    let x = this.x.toString()
    let y = this.y.toString()
    if (x.length > 5) x = x.slice(0, 5) + '…'
    if (y.length > 5) y = y.slice(0, 5) + '…'
    return `NodeGeometry([${x}, ${y}] ${this.width} × ${this.height})`
}
function getX(this: NodeGeometry): number {
    return this.position[0]
}
function getY(this: NodeGeometry): number {
    return this.position[1]
}
function setX(this: NodeGeometry, x: number): void {
    this.position[0] = x
}
function setY(this: NodeGeometry, y: number): void {
    this.position[1] = y
}
function getW(this: NodeGeometry): number {
    return this.size[0]
}
function getH(this: NodeGeometry): number {
    return this.size[1]
}
function setW(this: NodeGeometry, w: number): void {
    this.size[0] = w
}
function setH(this: NodeGeometry, h: number): void {
    this.size[1] = h
}

function getCenter(c: vec2, p: vec2, s: vec2, out?: vec2): ReadonlyVec2 {
    vec2.scaleAndAdd(out ?? c, p, s, 0.5)
    return c
}

//const NodeGeometryPrototype = { } // nah...

export function NodeGeometry(props: NodeGeometryProps): NodeGeometry
export function NodeGeometry(position: vec2, size: vec2): NodeGeometry
export function NodeGeometry(a: any, b?: any): NodeGeometry {
    // store 4 ints
    const buffer = new ArrayBuffer(6 * Float32Array.BYTES_PER_ELEMENT)
    const position = new Float32Array(buffer, 0, 2) as vec2
    const size = new Float32Array(buffer, 8, 2) as vec2
    const _center = new Float32Array(buffer, 8, 2) as vec2
    if (b === undefined) {
        position[0] = a.x ?? 0
        position[1] = a.y ?? 0
        size[0] = a.width
        size[1] = a.height
    } else {
        vec2.copy(position, a)
        vec2.copy(size, b)
    }
    return Object.create(null, {
        buffer: { value: buffer },
        position: { value: position, enumerable: true },
        size: { value: size, enumerable: true },
        x: { get: getX, set: setX, enumerable: true },
        y: { get: getY, set: setY, enumerable: true },
        width: { get: getW, set: setW, enumerable: true },
        height: { get: getH, set: setH, enumerable: true },
        center: { value: getCenter.bind(null, _center, position, size) },
        toString: { value: toString, enumerable: true },
    })
}
