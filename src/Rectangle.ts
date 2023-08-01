import type { Indexable, Quadrant } from './types'

import { vec2 } from "gl-matrix";
import { NodeGeometry } from './NodeGeometry';
import { QUAD } from './types'

/**
 * Rectangle Geometry
 * @beta
 *
 * @remarks
 * This interface simply represents a rectangle geometry.
 */
export interface RectangleGeometry {
    /**
     * X start of the rectangle (top left).
     */
    x: number

    /**
     * Y start of the rectangle (top left).
     */
    y: number

    /**
     * Width of the rectangle.
     */
    width: number

    /**
     * Height of the rectangle.
     */
    height: number

    /**
     * X,Y position vector of the node
     */
    readonly position: vec2;

    /**
     * Width, Height size vector of the node
     */
    readonly size: vec2;


}

/**
 * Rectangle Constructor Properties
 * @beta
 * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
 */
export interface RectangleProps<CustomDataType = void>
    extends Omit<RectangleGeometry, 'position'|'size'> {
    /**
     * Whether this rectangle should be removed during a typical .clear call
     */
    qtStatic?: boolean

    /**
     * Custom data
     */
    data?: CustomDataType
}

/**
 * Class representing a Rectangle
 * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
 *
 * @example Without custom data (JS/TS):
 * ```typescript
 * const rectangle = new Rectangle({
 *   x: 10,
 *   y: 20,
 *   width: 30,
 *   height: 40,
 * });
 * ```
 *
 * @example With custom data (JS/TS):
 * ```javascript
 * const rectangle = new Rectangle({
 *   x: 10,
 *   y: 20,
 *   width: 30,
 *   height: 40,
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
 * const rectangle1 = new Rectangle({
 *   x: 10,
 *   y: 20,
 *   width: 30,
 *   height: 40,
 *   data: entity,
 * });
 *
 * // You can also pass in a generic type for the data property
 * const rectangle2 = new Rectangle<ObjectData>({
 *   x: 10,
 *   y: 20,
 *   width: 30,
 *   height: 40,
 * });
 * rectangle2.data = entity;
 * ```
 *
 * @example With custom class extending Rectangle (implements {@link RectangleGeometry} (x, y, width, height)):
 * ```javascript
 * // extending inherits the qtIndex method
 * class Box extends Rectangle {
 *
 *   constructor(props) {
 *     // call super to set x, y, width, height (and data, if given)
 *     super(props);
 *     this.content = props.content;
 *   }
 * }
 *
 * const box = new Box({
 *   content: 'Gravity Boots',
 *   x: 10,
 *   y: 20,
 *   width: 30,
 *   height: 40,
 * });
 * ```
 *
 * @example With custom class and mapping {@link RectangleGeometry}:
 * ```javascript
 * // no need to extend if you don't implement RectangleGeometry
 * class Box {
 *
 *   constructor(content) {
 *     this.content = content;
 *     this.position = [10, 20];
 *     this.size = [30, 40];
 *   }
 *
 *   // add a qtIndex method to your class
 *   qtIndex(node) {
 *     // map your properties to RectangleGeometry
 *     return Rectangle.prototype.qtIndex.call({
 *       x: this.position[0],
 *       y: this.position[1],
 *       width: this.size[0],
 *       height: this.size[1],
 *     }, node);
 *   }
 * }
 *
 * const box = new Box('Gravity Boots');
 * ```
 *
 * @example With custom object that implements {@link RectangleGeometry}:
 * ```javascript
 * const player = {
 *   name: 'Jane',
 *   health: 100,
 *   x: 10,
 *   y: 20,
 *   width: 30,
 *   height: 30,
 *   qtIndex: Rectangle.prototype.qtIndex,
 * });
 * ```
 *
 * @example With custom object and mapping {@link RectangleGeometry}:
 * ```javascript
 * // Note: this is not recommended but possible.
 * // Using this technique, each object would have it's own qtIndex method.
 * // Rather add qtIndex to your prototype, e.g. by using classes like shown above.
 * const player = {
 *   name: 'Jane',
 *   health: 100,
 *   position: [10, 20],
 *   size: [30, 40],
 *   qtIndex: function(node) {
 *     return Rectangle.prototype.qtIndex.call({
 *       x: this.position[0],
 *       y: this.position[1],
 *       width: this.size[0],
 *       height: this.size[1],
 *     }, node);
 *   },
 * });
 * ```
 */
export class Rectangle<CustomDataType = void>
    implements RectangleGeometry, Indexable
{
    /**
     * Whether this rectangle should be removed during a typical .clear call
     */
    qtStatic: boolean

    /**
     * Custom data.
     */
    data?: CustomDataType

    /**
     * X,Y position vector of the node
     */
    readonly position: vec2;

    /**
     * Width, Height size vector of the node
     */
    readonly size: vec2;

    private readonly buffer: ArrayBuffer;

    constructor(props: RectangleProps<CustomDataType>) {
        this.buffer = new ArrayBuffer(4 * Float32Array.BYTES_PER_ELEMENT);
        this.position = new Float32Array(this.buffer, 0, 2) as vec2;
        this.size = new Float32Array(this.buffer, 8, 2) as vec2;
        this.position[0] = props.x ?? 0;
        this.position[1] = props.y ?? 0;
        this.size[0] = props.width;
        this.size[1] = props.height;
        this.qtStatic = props.qtStatic ?? false;
        if (props.data != null) this.data = props.data
    }

    /**
     * X start of the rectangle (top left).
     */
    get x (): number { return this.position[0]; }
    set x (x: number) { this.position[0] = x; }

    /**
     * Y start of the rectangle (top left).
     */
    get y (): number { return this.position[1]; }
    set y (y: number) { this.position[1] = y; }

    /**
     * Width of the rectangle.
     */
    get width (): number { return this.size[0]; }
    set width (width: number) { this.size[0] = width; }

    /**
     * Height of the rectangle.
     */
    get height (): number { return this.size[1]; }
    set height (height: number) { this.size[1] = height; }

    // xStart,yStart, xEnd, yEnd
    /*
    * [Symbol.iterator] (): Generator {
      yield this.position[0];
      yield this.position[1];
      yield this.size[0] + this.position[0];
      yield this.size[1] + this.position[1];
    }
    */

    /**
     * Determine which quadrant this rectangle belongs to.
     * @param node - Quadtree node to be checked
     * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right)
     */
    * qtIndex(node: NodeGeometry): Generator<Quadrant> {
        const center = node.center();
        const startIsWest = this.position[0] < center[0];
        const startIsNorth = this.position[1] < center[1];
        const end = vec2.add(vec2.create(), this.size, this.position);
        const endIsEast = end[0] > center[0];
        const endIsSouth = end[1] > center[1];

        if (startIsNorth && endIsEast) yield QUAD.NE;
        if (startIsWest && startIsNorth) yield QUAD.NW;
        if (startIsWest && endIsSouth) yield QUAD.SW;
        if (endIsEast && endIsSouth) yield QUAD.SE;
    }
}
