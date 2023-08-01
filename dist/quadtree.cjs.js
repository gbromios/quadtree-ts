'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const glMatrix = require('gl-matrix');

function toString() {
    let x = this.x.toString();
    let y = this.y.toString();
    if (x.length > 5)
        x = x.slice(0, 5) + '…';
    if (y.length > 5)
        y = y.slice(0, 5) + '…';
    return `NodeGeometry([${x}, ${y}] ${this.width} × ${this.height})`;
}
function getX() {
    return this.position[0];
}
function getY() {
    return this.position[1];
}
function setX(x) {
    this.position[0] = x;
}
function setY(y) {
    this.position[1] = y;
}
function getW() {
    return this.size[0];
}
function getH() {
    return this.size[1];
}
function setW(w) {
    this.size[0] = w;
}
function setH(h) {
    this.size[1] = h;
}
function getCenter(c, p, s, out) {
    glMatrix.vec2.scaleAndAdd(out ?? c, p, s, 0.5);
    return c;
}
function NodeGeometry(a, b) {
    // store 4 ints
    const buffer = new ArrayBuffer(6 * Float32Array.BYTES_PER_ELEMENT);
    const position = new Float32Array(buffer, 0, 2);
    const size = new Float32Array(buffer, 8, 2);
    const _center = new Float32Array(buffer, 8, 2);
    if (b === undefined) {
        position[0] = a.x ?? 0;
        position[1] = a.y ?? 0;
        size[0] = a.width;
        size[1] = a.height;
    }
    else {
        glMatrix.vec2.copy(position, a);
        glMatrix.vec2.copy(size, b);
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
    });
}

//import { Quadrant } from './types';
/* curious if this might be faster tbh
function * _generate<T extends ObjectsType>(this: Subtree<T>):
  Generator<Quadtree<T>>
{
  yield this[QUAD.NE];
  yield this[QUAD.NW];
  yield this[QUAD.SW];
  yield this[QUAD.SE];
}
*/
function Subtree(root) {
    const width = root.bounds.width / 2;
    const height = root.bounds.height / 2;
    const x = root.bounds.x;
    const y = root.bounds.y;
    const level = root.level + 1;
    const props = {
        width,
        height,
        maxObjects: root.maxObjects,
        maxLevels: root.maxLevels,
    };
    return Object.freeze([
        new Quadtree({ x: x + width, y: y, ...props }, level),
        new Quadtree({ x: x, y: y, ...props }, level),
        new Quadtree({ x: x, y: y + height, ...props }, level),
        new Quadtree({ x: x + width, y: y + height, ...props }, level),
    ]);
}

const DEFAULT_MAX_OBJECTS = 10;
const DEFAULT_MAX_LEVELS = 4;
/**
 * Class representing a Quadtree node.
 *
 * @example
 * ```typescript
 * const tree = new Quadtree({
 *   width: 100,
 *   height: 100,
 *   x: 0,           // optional, default:  0
 *   y: 0,           // optional, default:  0
 *   maxObjects: 10, // optional, default: 10
 *   maxLevels: 4,   // optional, default:  4
 * });
 * ```
 *
 * @example Typescript: If you like to be explicit, you optionally can pass in a generic type for objects to be stored in the Quadtree:
 * ```typescript
 * class GameEntity extends Rectangle {
 *   ...
 * }
 * const tree = new Quadtree<GameEntity>({
 *   width: 100,
 *   height: 100,
 * });
 * ```
 */
class Quadtree {
    /**
     * The numeric boundaries of this node.
     * @readonly
     */
    bounds;
    /**
     * Max objects this node can hold before it splits.
     * @defaultValue `10`
     * @readonly
     */
    maxObjects;
    minObjects;
    /**
     * Total max nesting levels of the root Quadtree node.
     * @defaultValue `4`
     * @readonly
     */
    maxLevels;
    /**
     * The level of this node.
     * @defaultValue `0`
     * @readonly
     */
    level;
    /**
     * Array of objects in this node.
     * @defaultValue `[]`
     * @readonly
     */
    objects;
    /**
     * Subnodes of this node
     * @defaultValue `[]`
     * @readonly
     */
    nodes;
    /**
     * Quadtree Constructor
     * @param props - bounds and properties of the node
     * @param level - depth level (internal use only, required for subnodes)
     */
    constructor(props, level = 0) {
        this.bounds = NodeGeometry(props);
        this.maxObjects = props.maxObjects ?? DEFAULT_MAX_OBJECTS;
        if (this.maxObjects < 1)
            throw new Error('maxObjects must be > 0');
        this.minObjects = props.minObjects ?? Math.floor(this.maxObjects / 2);
        this.maxLevels = props.maxLevels ?? DEFAULT_MAX_LEVELS;
        this.level = level;
        this.objects = [];
        this.nodes = null;
    }
    /**
     * Get the quadrant (subnode indexes) an object belongs to.
     *
     * @example Mostly for internal use but you can call it like so:
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * const rectangle = new Rectangle({ x: 25, y: 25, width: 10, height: 10 });
     * const indexes = tree.getIndex(rectangle);
     * console.log(indexes); // [1]
     * ```
     *
     * @param obj - object to be checked
     * @returns Iterable containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right).
     */
    *getIndex(obj) {
        if (this.nodes) {
            for (const quadrantIndex of obj.qtIndex(this.bounds)) {
                yield this.nodes[quadrantIndex];
            }
        }
    }
    /**
     * Split the node into 4 subnodes.
     * @internal
     *
     * @example Mostly for internal use! You should only call this yourself if you know what you are doing:
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.split();
     * console.log(tree); // now tree has four subnodes
     * ```
     */
    split() {
        // TODO - guard against calling when already split?
        if (this.nodes || !this.objects)
            throw new Error('already split!');
        this.nodes = Subtree(this);
        for (const o of this.objects) {
            for (const node of this.getIndex(o)) {
                node._size++;
                node.objects?.push(o);
            }
        }
        this.objects = null;
    }
    /**
     * Insert an object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding subnodes.
     *
     * @example you can use any shape here (or object with a qtIndex method, see README):
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.insert(new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'data' }));
     * tree.insert(new Circle({ x: 25, y: 25, r: 10, data: 512 }));
     * tree.insert(new Line({ x1: 25, y1: 25, x2: 60, y2: 40, data: { custom: 'property'} }));
     * ```
     *
     * @param obj - Object to be added.
     */
    insert(obj) {
        //if we have subnodes, call insert on matching subnodes
        if (this.nodes) {
            for (const node of this.getIndex(obj))
                node.insert(obj);
        }
        else if (this.objects) {
            //maxObjects reached
            if (this.objects.push(obj) > this.maxObjects &&
                this.level < this.maxLevels) {
                this.split();
            }
        }
        else {
            throw new Error('nowhere to store objects!');
        }
        this._size++;
    }
    /**
     * Return all objects that could collide with the given geometry.
     *
     * @example Just like insert, you can use any shape here (or object with a qtIndex method, see README):
     * ```typescript
     * tree.retrieve(new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'data' }));
     * tree.retrieve(new Circle({ x: 25, y: 25, r: 10, data: 512 }));
     * tree.retrieve(new Line({ x1: 25, y1: 25, x2: 60, y2: 40, data: { custom: 'property'} }));
     * ```
     *
     * @param obj - geometry to be checked
     * @returns Array containing all detected objects.
     */
    retrieve(obj, out, predicate, dedupe) {
        out ??= [];
        if (this.objects) {
            if (predicate)
                out.push(...this.objects.filter(predicate));
            else
                out.push(...this.objects);
        }
        else if (this.nodes) {
            if (!predicate || dedupe)
                predicate = this._makePredicate(predicate);
            for (const node of this.getIndex(obj)) {
                node.retrieve(obj, out, predicate, false);
            }
        }
        else {
            throw new Error('no nodes or objects!!');
        }
        return out;
    }
    _makePredicate(original) {
        const seen = new Set();
        if (original)
            return (o) => {
                if (seen.has(o))
                    return false;
                seen.add(o);
                return original(o);
            };
        else
            return (o) => {
                if (seen.has(o))
                    return false;
                seen.add(o);
                return true;
            };
    }
    /**
     * Clear the Quadtree.
     * @param {boolean} [force=false] - when false, will skip clearing objects
     *   where qtStatic === true; true deletes everything with no exceptions.
     * @example
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.insert(new Circle({ x: 25, y: 25, r: 10 }));
     * tree.clear();
     * console.log(tree); // tree.objects and tree.nodes are empty
     * ```
     */
    clear(force = false) {
        if (force) {
            this.objects = [];
            this.nodes = null;
            this._size = 0;
        }
        else {
            this.objects = [...this].filter((o) => o.qtStatic);
            this.nodes = null;
            this.rebalance();
        }
    }
    rebalance() {
        const objects = [...this];
        this.clear(true);
        for (const o of objects)
            this.insert(o);
        /*
        // I assume this is a cleanup measure?
        for(let i=0; i < this.nodes.length; i++) {
            if(this.nodes.length) {
                this.nodes[i].clear();
            }
        }
        */
    }
    _size = 0;
    get size() {
        return this._size;
    }
    /**
     * Remove a node from the Quadtree.
     * @param {T} obj - the object to be removed. will be matched
     *   purely on equality comparison.
     * @param {boolean} [consolidate] - whether to "collapse" subtrees
     *   where a removed object has brought the number of total objects under
     *   maxObjects. if omitted, will be true when the final number of objects
     *   is <= minObjects.
     */
    remove(obj, consolidate) {
        if (this.objects) {
            const index = this.objects.indexOf(obj);
            if (index === -1)
                return false;
            this._size--;
            this.objects.splice(index, 1);
            return true;
        }
        else if (this.nodes) {
            let removed = false;
            for (const node of this.getIndex(obj)) {
                removed = node.remove(obj, false) || removed;
            }
            if (removed) {
                this._size--;
                if (consolidate ?? this.size <= this.minObjects)
                    this.consolidate();
            }
            return removed;
        }
        else {
            return false;
        }
    }
    removeMultiple(objs, consolidate) {
        let removed = false;
        for (const o of objs)
            removed = this.remove(o) || removed;
        if (removed && (consolidate ?? this.size <= this.minObjects))
            this.consolidate();
        return removed;
    }
    // opposite of split
    consolidate() {
        if (!this.nodes)
            return false;
        if (this.size <= this.maxObjects) {
            this.objects = [...this];
            this.nodes = null;
            return true;
        }
        let consolidated = false;
        for (const node of this.nodes) {
            consolidated = node.consolidate() || consolidated;
        }
        return consolidated;
    }
    /**
     * Iterate over each object in this tree, in no particular order.
     * @param {(o: T) => boolean} [predicate] - an optional function
     */
    *values(predicate, dedupe) {
        if (this.objects) {
            // given a set of objects to check for duplicate membership
            if (predicate) {
                for (const o of this.objects) {
                    if (predicate(o))
                        yield o;
                }
            }
            else {
                for (const o of this.objects)
                    yield o;
            }
        }
        else if (this.nodes) {
            if (!predicate || dedupe)
                predicate = this._makePredicate(predicate);
            for (const node of this.nodes) {
                for (const o of node.values(predicate, false))
                    yield o;
            }
        }
    }
    /**
     * Iterate over each object in this tree, in no particular order.
     * Just a convenient way to call .value with no arguments.
     */
    [Symbol.iterator]() {
        return this.values(this._makePredicate());
    }
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
class Rectangle {
    /**
     * Whether this rectangle should be removed during a typical .clear call
     */
    qtStatic;
    /**
     * Custom data.
     */
    data;
    /**
     * X,Y position vector of the node
     */
    position;
    /**
     * Width, Height size vector of the node
     */
    size;
    buffer;
    constructor(props) {
        this.buffer = new ArrayBuffer(4 * Float32Array.BYTES_PER_ELEMENT);
        this.position = new Float32Array(this.buffer, 0, 2);
        this.size = new Float32Array(this.buffer, 8, 2);
        this.position[0] = props.x ?? 0;
        this.position[1] = props.y ?? 0;
        this.size[0] = props.width;
        this.size[1] = props.height;
        this.qtStatic = props.qtStatic ?? false;
        if (props.data != null)
            this.data = props.data;
    }
    /**
     * X start of the rectangle (top left).
     */
    get x() {
        return this.position[0];
    }
    set x(x) {
        this.position[0] = x;
    }
    /**
     * Y start of the rectangle (top left).
     */
    get y() {
        return this.position[1];
    }
    set y(y) {
        this.position[1] = y;
    }
    /**
     * Width of the rectangle.
     */
    get width() {
        return this.size[0];
    }
    set width(width) {
        this.size[0] = width;
    }
    /**
     * Height of the rectangle.
     */
    get height() {
        return this.size[1];
    }
    set height(height) {
        this.size[1] = height;
    }
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
    *qtIndex(node) {
        const center = node.center();
        const startIsWest = this.position[0] < center[0];
        const startIsNorth = this.position[1] < center[1];
        const end = glMatrix.vec2.add(glMatrix.vec2.create(), this.size, this.position);
        const endIsEast = end[0] > center[0];
        const endIsSouth = end[1] > center[1];
        if (startIsNorth && endIsEast)
            yield 0 /* NE */;
        if (startIsWest && startIsNorth)
            yield 1 /* NW */;
        if (startIsWest && endIsSouth)
            yield 2 /* SW */;
        if (endIsEast && endIsSouth)
            yield 3 /* SE */;
    }
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
class Circle {
    center;
    /**
     * Radius of the circle.
     */
    r;
    /**
     * Whether this circle should be removed during a typical .clear call
     */
    qtStatic;
    /**
     * Custom data.
     */
    data;
    /**
     * Circle Constructor
     * @param props - Circle properties
     * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
     */
    constructor(props) {
        this.center = glMatrix.vec2.fromValues(props.x, props.y);
        this.r = props.r;
        this.qtStatic = props.qtStatic;
        this.data = props.data;
    }
    get x() {
        return this.center[0];
    }
    set x(x) {
        this.center[0] = x;
    }
    /**
     * Y start of the rectangle (top left).
     */
    get y() {
        return this.center[1];
    }
    set y(y) {
        this.center[1] = y;
    }
    /**
     * Determine which quadrant this circle belongs to.
     * @param node - Quadtree node to be checked
     * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right)
     */
    *qtIndex(node) {
        const sub = NodeGeometry(node.position, node.size);
        glMatrix.vec2.scale(sub.size, sub.size, 0.5);
        if (this.intersectRect(sub))
            yield 1 /* NW */;
        sub.position[0] += sub.size[0];
        if (this.intersectRect(sub))
            yield 0 /* NE */;
        sub.position[1] += sub.size[1];
        if (this.intersectRect(sub))
            yield 3 /* SE */;
        sub.position[0] -= sub.size[0];
        if (this.intersectRect(sub))
            yield 2 /* SW */;
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
    static intersectRect(x, y, r, minX, minY, maxX, maxY) {
        const dx = x - Math.max(minX, Math.min(x, maxX));
        const dy = y - Math.max(minY, Math.min(y, maxY));
        return dx * dx + dy * dy < r * r;
    }
    intersectRect(pr, s) {
        // seems shady but... the signature saves us
        if (!s)
            ({ position: pr, size: s } = pr);
        return Circle.intersectRect(this.center[0], this.center[1], this.r, pr[0], pr[1], pr[0] + s[0], pr[1] + s[1]);
    }
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
class Line {
    /**
     * Whether this circle should be removed during a typical .clear call
     */
    qtStatic;
    /**
     * Custom data.
     */
    data;
    /**
     * x,y vector for the start of the line
     */
    a;
    /**
     * x,y vector for the end of the line
     */
    b;
    buffer;
    /**
     * Line Constructor
     * @param props - Line properties
     * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
     */
    constructor(props) {
        this.buffer = new ArrayBuffer(4 * Float32Array.BYTES_PER_ELEMENT);
        this.a = new Float32Array(this.buffer, 0, 2);
        this.b = new Float32Array(this.buffer, 8, 2);
        this.a[0] = props.x1;
        this.a[1] = props.y1;
        this.b[0] = props.x2;
        this.b[1] = props.y2;
        this.qtStatic = props.qtStatic ?? false;
        if (props.data != null)
            this.data = props.data;
    }
    toString() {
        return `Line([${this.a[0]}, ${this.a[1]}] → [${this.b[0]}, ${this.b[1]}])`;
    }
    /**
     * X start of the line.
     */
    get x1() {
        return this.a[0];
    }
    set x1(x1) {
        this.a[0] = x1;
    }
    /**
     * Y start of the line.
     */
    get y1() {
        return this.a[1];
    }
    set y1(y1) {
        this.a[1] = y1;
    }
    /**
     * X end of the line.
     */
    get x2() {
        return this.b[0];
    }
    set x2(x2) {
        this.b[0] = x2;
    }
    /**
     * Y end of the line.
     */
    get y2() {
        return this.b[1];
    }
    set y2(y2) {
        this.b[1] = y2;
    }
    /**
     * Determine which quadrant this line belongs to.
     * @beta
     * @param node - Quadtree node to be checked
     * @returns Generator of colliding quad indices
     */
    *qtIndex(node) {
        const sub = NodeGeometry(node.position, node.size);
        glMatrix.vec2.scale(sub.size, sub.size, 0.5);
        if (this.intersectRect(sub))
            yield 1 /* NW */;
        sub.position[0] += sub.size[0];
        if (this.intersectRect(sub))
            yield 0 /* NE */;
        sub.position[1] += sub.size[1];
        if (this.intersectRect(sub))
            yield 3 /* SE */;
        sub.position[0] -= sub.size[0];
        if (this.intersectRect(sub))
            yield 2 /* SW */;
    }
    intersectRect(pr, s) {
        // seems shady but... the signature saves us
        if (!s)
            ({ position: pr, size: s } = pr);
        return Line.intersectRect(this.a[0], this.a[1], this.b[0], this.b[1], pr[0], pr[1], pr[0] + s[0], pr[1] + s[1]);
    }
    // x1, y1, x2, y2
    *[Symbol.iterator]() {
        yield this.a[0];
        yield this.a[1];
        yield this.b[0];
        yield this.b[1];
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
    static intersectRect(x1, y1, x2, y2, minX, minY, maxX, maxY) {
        // Completely outside
        if ((x1 <= minX && x2 <= minX) ||
            (y1 <= minY && y2 <= minY) ||
            (x1 >= maxX && x2 >= maxX) ||
            (y1 >= maxY && y2 >= maxY))
            return false;
        // Single point inside
        if ((x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) ||
            (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY))
            return true;
        const m = (y2 - y1) / (x2 - x1);
        let y = m * (minX - x1) + y1;
        if (y > minY && y < maxY)
            return true;
        y = m * (maxX - x1) + y1;
        if (y > minY && y < maxY)
            return true;
        let x = (minY - y1) / m + x1;
        if (x > minX && x < maxX)
            return true;
        x = (maxY - y1) / m + x1;
        if (x > minX && x < maxX)
            return true;
        return false;
    }
}

exports.Circle = Circle;
exports.Line = Line;
exports.Quadtree = Quadtree;
exports.Rectangle = Rectangle;
