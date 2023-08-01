import { vec2 } from 'gl-matrix';
import { NodeGeometry } from './NodeGeometry';
import { RectangleGeometry } from './Rectangle';
import { Indexable, QUAD, Quadrant } from './types'

/**
 * Circle Geometry
 * @beta
 *
 * @remarks
 * This interface simply represents a circle geometry.
 */
export interface CircleGeometry {
    /**
     * X center of the circle.
     */
    x: number

    /**
     * Y center of the circle.
     */
    y: number

    /**
     * Radius of the circle.
     */
    r: number

    readonly center: vec2;
}

/**
 * Circle Constructor Properties
 * @beta
 * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
 */
export interface CircleProps<CustomDataType = void> extends Omit<CircleGeometry, 'center'> {
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
 * Class representing a Circle.
 * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
 *
 * @example Without custom data (JS/TS):
 * ```typescript
 * const circle = new Circle({
 *   x: 100,
 *   y: 100,
 *   r: 32,
 * });
 * ```
 *
 * @example With custom data (JS/TS):
 * ```javascript
 * const circle = new Circle({
 *   x: 100,
 *   y: 100,
 *   r: 32,
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
 * const circle1 = new Circle({
 *   x: 100,
 *   y: 100,
 *   r: 32,
 *   data: entity,
 * });
 *
 * // You can also pass in a generic type for the data property
 * const circle2 = new Circle<ObjectData>({
 *   x: 100,
 *   y: 100,
 *   r: 32,
 * });
 * circle2.data = entity;
 * ```
 *
 * @example With custom class extending Circle (implements {@link CircleGeometry} (x, y, r)):
 * ```javascript
 * // extending inherits the qtIndex method
 * class Bomb extends Circle {
 *
 *   constructor(props) {
 *     // call super to set x, y, r (and data, if given)
 *     super(props);
 *     this.countdown = props.countdown;
 *   }
 * }
 *
 * const bomb = new Bomb({
 *   countdown: 5,
 *   x: 10,
 *   y: 20,
 *   r: 30,
 * });
 * ```
 *
 * @example With custom class and mapping {@link CircleGeometry}:
 * ```javascript
 * // no need to extend if you don't implement CircleGeometry
 * class Bomb {
 *
 *   constructor(countdown) {
 *     this.countdown = countdown;
 *     this.position = [10, 20];
 *     this.radius = 30;
 *   }
 *
 *   // add a qtIndex method to your class
 *   qtIndex(node) {
 *     // map your properties to CircleGeometry
 *     return Circle.prototype.qtIndex.call({
 *       x: this.position[0],
 *       y: this.position[1],
 *       r: this.radius,
 *     }, node);
 *   }
 * }
 *
 * const bomb = new Bomb(5);
 * ```
 *
 * @example With custom object that implements {@link CircleGeometry}:
 * ```javascript
 * const player = {
 *   name: 'Jane',
 *   health: 100,
 *   x: 10,
 *   y: 20,
 *   r: 30,
 *   qtIndex: Circle.prototype.qtIndex,
 * });
 * ```
 *
 * @example With custom object and mapping {@link CircleGeometry}:
 * ```javascript
 * // Note: this is not recommended but possible.
 * // Using this technique, each object would have it's own qtIndex method.
 * // Rather add qtIndex to your prototype, e.g. by using classes like shown above.
 * const player = {
 *   name: 'Jane',
 *   health: 100,
 *   position: [10, 20],
 *   radius: 30,
 *   qtIndex: function(node) {
 *     return Circle.prototype.qtIndex.call({
 *       x: this.position[0],
 *       y: this.position[1],
 *       r: this.radius,
 *     }, node);
 *   },
 * });
 * ```
 */
export class Circle<CustomDataType = void>
    implements CircleGeometry, Indexable
{
    readonly center: vec2;

    /**
     * Radius of the circle.
     */
    r: number

    /**
     * Whether this circle should be removed during a typical .clear call
     */
    qtStatic?: boolean

    /**
     * Custom data.
     */
    data?: CustomDataType

    /**
     * Circle Constructor
     * @param props - Circle properties
     * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
     */
    constructor(props: CircleProps<CustomDataType>) {
        this.center = vec2.fromValues(props.x, props.y);
        this.r = props.r
        this.qtStatic = props.qtStatic
        this.data = props.data
    }

    get x (): number { return this.center[0]; }
    set x (x: number) { this.center[0] = x; }

    /**
     * Y start of the rectangle (top left).
     */
    get y (): number { return this.center[1]; }
    set y (y: number) { this.center[1] = y; }



    /**
     * Determine which quadrant this circle belongs to.
     * @param node - Quadtree node to be checked
     * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right)
     */
    * qtIndex(node: NodeGeometry): Generator<Quadrant> {
        const sub = NodeGeometry(node.position, node.size);
        vec2.scale(sub.size, sub.size, 0.5);
        if (this.intersectRect(sub)) yield QUAD.NW;

        sub.position[0] += sub.size[0];
        if (this.intersectRect(sub)) yield QUAD.NE;

        sub.position[1] += sub.size[1];
        if (this.intersectRect(sub)) yield QUAD.SE;

        sub.position[0] -= sub.size[0];
        if (this.intersectRect(sub)) yield QUAD.SW;
    }

    /**
     * Check if a circle intersects an axis aligned rectangle.
     * @beta
     * @see https://yal.cc/rectangle-circle-intersection-test/
     * @param x - circle center X
     * @param y - circle center Y
     * @param r - circle radius
     * @param minX - rectangle start X
     * @param minY - rectangle start Y
     * @param maxX - rectangle end X
     * @param maxY - rectangle end Y
     * @returns true if circle intersects rectangle
     *
     * @example Check if a circle intersects a rectangle:
     * ```javascript
     * const circ = { x: 10, y: 20, r: 30 };
     * const rect = { x: 40, y: 50, width: 60, height: 70 };
     * const intersect = Circle.intersectRect(
     *   circ.x,
     *   circ.y,
     *   circ.r,
     *   rect.x,
     *   rect.y,
     *   rect.x + rect.width,
     *   rect.y + rect.height,
     * );
     * console.log(circle, rect, 'intersect?', intersect);
     * ```
     */
    static intersectRect(
        x: number,
        y: number,
        r: number,
        minX: number,
        minY: number,
        maxX: number,
        maxY: number
    ): boolean {
        const dx = x - Math.max(minX, Math.min(x, maxX))
        const dy = y - Math.max(minY, Math.min(y, maxY))
        return dx * dx + dy * dy < r * r
    }

    intersectRect (rectangle: RectangleGeometry): boolean;
    intersectRect (position: vec2, size: vec2): boolean;
    intersectRect (pr: RectangleGeometry|vec2, s?: vec2) {
      // seems shady but... the signature saves us
      if (!s) ({ position: pr, size: s } = pr as RectangleGeometry);
      return Circle.intersectRect(
        this.center[0],
        this.center[1],
        this.r,
        (pr as vec2)[0],
        (pr as vec2)[1],
        (pr as vec2)[0] + s[0],
        (pr as vec2)[1] + s[1],
      );
    }

 
}
