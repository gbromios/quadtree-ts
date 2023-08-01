import { vec2 } from 'gl-matrix'
import { NodeGeometry } from './NodeGeometry'
import type { Rectangle, RectangleGeometry } from './Rectangle'
import { Indexable, QUAD, Quadrant } from './types'

/**
 * Line Geometry
 * @beta
 *
 * @remarks
 * This interface simply represents a line geometry.
 */
export interface LineGeometry {
    /**
     * X start of the line.
     */
    x1: number

    /**
     * Y start of the line.
     */
    y1: number

    /**
     * X end of the line.
     */
    x2: number

    /**
     * Y end of the line.
     */
    y2: number
}

/**
 * Line Constructor Properties
 * @beta
 * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
 */
export interface LineProps<CustomDataType = void> extends LineGeometry {
    /**
     * Whether this circle should be removed during a typical .clear call
     */
    qtStatic?: boolean

    /**
     * Custom data
     */
    data?: CustomDataType
}

/**
 * Class representing a Line
 * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
 *
 * @example Without custom data (JS/TS):
 * ```typescript
 * const line = new Line({
 *   x1: 10,
 *   y1: 20,
 *   x2: 30,
 *   y2: 40,
 * });
 * ```
 *
 * @example With custom data (JS/TS):
 * ```javascript
 * const line = new Line({
 *   x1: 10,
 *   y1: 20,
 *   x2: 30,
 *   y2: 40,
 *   data: {
 *     name: 'Jane',
 *     health: 100,
 *   },
 * });
 * ```
 *
 * @example With custom data (TS):
 * ```typescript
 * interface ObjectData {
 *   name: string
 *   health: number
 * }
 * const entity: ObjectData = {
 *   name: 'Jane',
 *   health: 100,
 * };
 *
 * // Typescript will infer the type of the data property
 * const line1 = new Line({
 *   x1: 10,
 *   y1: 20,
 *   x2: 30,
 *   y2: 40,
 *   data: entity,
 * });
 *
 * // You can also pass in a generic type for the data property
 * const line2 = new Line<ObjectData>({
 *   x1: 10,
 *   y1: 20,
 *   x2: 30,
 *   y2: 40,
 * });
 * line2.data = entity;
 * ```
 *
 * @example With custom class extending Line (implements {@link LineGeometry} (x1, y1, x2, y2)):
 * ```javascript
 * // extending inherits the qtIndex method
 * class Laser extends Line {
 *
 *   constructor(props) {
 *     // call super to set x1, y1, x2, y2 (and data, if given)
 *     super(props);
 *     this.color = props.color;
 *   }
 * }
 *
 * const laser = new Laser({
 *   color: 'green',
 *   x1: 10,
 *   y1: 20,
 *   x2: 30,
 *   y2: 40,
 * });
 * ```
 *
 * @example With custom class and mapping {@link LineGeometry}:
 * ```javascript
 * // no need to extend if you don't implement LineGeometry
 * class Laser {
 *
 *   constructor(color) {
 *     this.color = color;
 *     this.start = [10, 20];
 *     this.end = [30, 40];
 *   }
 *
 *   // add a qtIndex method to your class
 *   qtIndex(node) {
 *     // map your properties to LineGeometry
 *     return Line.prototype.qtIndex.call({
 *       x1: this.start[0],
 *       y1: this.start[1],
 *       x2: this.end[0],
 *       y2: this.end[1],
 *     }, node);
 *   }
 * }
 *
 * const laser = new Laser('green');
 * ```
 *
 * @example With custom object that implements {@link LineGeometry}:
 * ```javascript
 * const player = {
 *   name: 'Jane',
 *   health: 100,
 *   x1: 10,
 *   y1: 20,
 *   x2: 30,
 *   y2: 40,
 *   qtIndex: Line.prototype.qtIndex,
 * });
 * ```
 *
 * @example With custom object and mapping {@link LineGeometry}:
 * ```javascript
 * // Note: this is not recommended but possible.
 * // Using this technique, each object would have it's own qtIndex method.
 * // Rather add qtIndex to your prototype, e.g. by using classes like shown above.
 * const player = {
 *   name: 'Jane',
 *   health: 100,
 *   start: [10, 20],
 *   end: [30, 40],
 *   qtIndex: function(node) {
 *     return Line.prototype.qtIndex.call({
 *       x1: this.start[0],
 *       y1: this.start[1],
 *       x2: this.end[0],
 *       y2: this.end[1],
 *     }, node);
 *   },
 * });
 * ```
 */
export class Line<CustomDataType = void> implements LineGeometry, Indexable {
    /**
     * Whether this circle should be removed during a typical .clear call
     */
    qtStatic?: boolean

    /**
     * Custom data.
     */
    data?: CustomDataType

    /**
     * x,y vector for the start of the line
     */
    readonly a: vec2

    /**
     * x,y vector for the end of the line
     */
    readonly b: vec2

    private readonly buffer: ArrayBuffer

    /**
     * Line Constructor
     * @param props - Line properties
     * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
     */
    constructor(props: LineProps<CustomDataType>) {
        this.buffer = new ArrayBuffer(4 * Float32Array.BYTES_PER_ELEMENT)
        this.a = new Float32Array(this.buffer, 0, 2) as vec2
        this.b = new Float32Array(this.buffer, 8, 2) as vec2
        this.a[0] = props.x1
        this.a[1] = props.y1
        this.b[0] = props.x2
        this.b[1] = props.y2
        this.qtStatic = props.qtStatic ?? false
        if (props.data != null) this.data = props.data
    }

    toString(): string {
        return `Line([${this.a[0]}, ${this.a[1]}] → [${this.b[0]}, ${this.b[1]}])`
    }
    /**
     * X start of the line.
     */
    get x1(): number {
        return this.a[0]
    }
    set x1(x1: number) {
        this.a[0] = x1
    }

    /**
     * Y start of the line.
     */
    get y1(): number {
        return this.a[1]
    }
    set y1(y1: number) {
        this.a[1] = y1
    }

    /**
     * X end of the line.
     */
    get x2(): number {
        return this.b[0]
    }
    set x2(x2: number) {
        this.b[0] = x2
    }

    /**
     * Y end of the line.
     */
    get y2(): number {
        return this.b[1]
    }
    set y2(y2: number) {
        this.b[1] = y2
    }

    /**
     * Determine which quadrant this line belongs to.
     * @beta
     * @param node - Quadtree node to be checked
     * @returns Generator of colliding quad indices
     */
    *qtIndex(node: NodeGeometry): Generator<Quadrant> {
        const sub = NodeGeometry(node.position, node.size)
        vec2.scale(sub.size, sub.size, 0.5)
        if (this.intersectRect(sub)) yield QUAD.NW
        sub.position[0] += sub.size[0]
        if (this.intersectRect(sub)) yield QUAD.NE
        sub.position[1] += sub.size[1]
        if (this.intersectRect(sub)) yield QUAD.SE
        sub.position[0] -= sub.size[0]
        if (this.intersectRect(sub)) yield QUAD.SW
    }

    intersectRect(rectangle: RectangleGeometry): boolean
    intersectRect(position: vec2, size: vec2): boolean
    intersectRect(pr: RectangleGeometry | vec2, s?: vec2) {
        // seems shady but... the signature saves us
        if (!s) ({ position: pr, size: s } = pr as RectangleGeometry)
        return Line.intersectRect(
            this.a[0],
            this.a[1],
            this.b[0],
            this.b[1],
            (pr as vec2)[0],
            (pr as vec2)[1],
            (pr as vec2)[0] + s[0],
            (pr as vec2)[1] + s[1]
        )
    }

    // x1, y1, x2, y2
    *[Symbol.iterator](): Generator<number> {
        yield this.a[0]
        yield this.a[1]
        yield this.b[0]
        yield this.b[1]
    }

    /**
     * check if a line segment (the first 4 parameters) intersects an axis aligned rectangle (the last 4 parameters)
     * @beta
     *
     * @remarks
     * There is a bug where detection fails on corner intersections
     * when the line enters/exits the node exactly at corners (45°)
     * {@link https://stackoverflow.com/a/18292964/860205}
     *
     * @param x1 - line start X
     * @param y1 - line start Y
     * @param x2 - line end X
     * @param y2 - line end Y
     * @param minX - rectangle start X
     * @param minY - rectangle start Y
     * @param maxX - rectangle end X
     * @param maxY - rectangle end Y
     * @returns true if the line segment intersects the axis aligned rectangle
     */
    static intersectRect(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ): boolean {
        // Completely outside
        if (
            (x1 <= minX && x2 <= minX) ||
            (y1 <= minY && y2 <= minY) ||
            (x1 >= maxX && x2 >= maxX) ||
            (y1 >= maxY && y2 >= maxY)
        )
            return false

        // Single point inside
        if (
            (x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) ||
            (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY)
        )
            return true

        const m = (y2 - y1) / (x2 - x1)

        let y = m * (minX - x1) + y1
        if (y > minY && y < maxY) return true

        y = m * (maxX - x1) + y1
        if (y > minY && y < maxY) return true

        let x = (minY - y1) / m + x1
        if (x > minX && x < maxX) return true

        x = (maxY - y1) / m + x1
        if (x > minX && x < maxX) return true

        return false
    }
}
