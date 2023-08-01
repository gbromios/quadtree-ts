import type { NodeGeometry, Indexable, ObjectsType, Quadrant } from './types';
import type { Rectangle } from './Rectangle';
import type { Circle } from './Circle';
import type { Line } from './Line';
import { Subtree } from './Subtree';

const DEFAULT_MAX_OBJECTS = 10;
const DEFAULT_MAX_LEVELS = 4;

/**
 * Quadtree Constructor Properties
 */
export interface QuadtreeProps {

    /**
     * Width of the node.
     */
    width: number

    /**
     * Height of the node.
     */
    height: number

    /**
     * X Offset of the node.
     * @defaultValue `0`
     */
    x?: number

    /**
     * Y Offset of the node.
     * @defaultValue `0`
     */
    y?: number

    /**
     * Max objects this node can hold before it splits.
     * @defaultValue `10`
     */
    maxObjects?: number

    /**
     * Min objects this node (and all sub-nodes) must hold before it
     *   automatically consolidates
     * @defaultValue `⌊maxObjects / 2⌋`
     */
    minObjects?: number



    /**
     * Total max nesting levels of the root Quadtree node.
     * @defaultValue `4`
     */
    maxLevels?: number
}

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
export class Quadtree<T extends ObjectsType> {

    /**
     * The numeric boundaries of this node.
     * @readonly
     */
    readonly bounds: Readonly<NodeGeometry>;

    /**
     * Max objects this node can hold before it splits.
     * @defaultValue `10`
     * @readonly
     */
    readonly maxObjects: number;

    readonly minObjects: number;
    
    /**
     * Total max nesting levels of the root Quadtree node.
     * @defaultValue `4`
     * @readonly
     */
    readonly maxLevels: number;

    /**
     * The level of this node.
     * @defaultValue `0`
     * @readonly
     */
    readonly level: number;

    /**
     * Array of objects in this node.
     * @defaultValue `[]`
     * @readonly
     */
    objects: T[]|null;

    /**
     * Subnodes of this node
     * @defaultValue `[]`
     * @readonly
     */
    nodes: Subtree<T>|null;

    /**
     * Quadtree Constructor
     * @param props - bounds and properties of the node
     * @param level - depth level (internal use only, required for subnodes)
     */

    constructor(props:QuadtreeProps, level=0) {
      this.bounds = {
        x: props.x ?? 0,
        y: props.y ?? 0,
        width: props.width,
        height: props.height,
      };
      this.maxObjects = props.maxObjects ?? DEFAULT_MAX_OBJECTS;
      if (this.maxObjects < 1) throw new Error('maxObjects must be > 0');
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
    * getIndex(obj:Rectangle|Circle|Line|Indexable): Generator<Quadtree<T>> {
      if (this.nodes) {
        for (const quadrantIndex of obj.qtIndex(this.bounds)) {
          yield this.nodes[quadrantIndex as Quadrant];
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
    split(): void {
      // TODO - guard against calling when already split?
      if (this.nodes || !this.objects) throw new Error('already split!');
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
    insert(obj:T): void {
      //if we have subnodes, call insert on matching subnodes
      if (this.nodes) {
        for (const node of this.getIndex(obj)) node.insert(obj);
      } else if (this.objects) {
        //maxObjects reached
        if (
          this.objects.push(obj) > this.maxObjects &&
          this.level < this.maxLevels
        ) {
          this.split();
        }
      } else {
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
    retrieve(
      obj:ObjectsType,
      out?: T[],
      predicate?: ((o: T) => boolean),
      dedupe?: boolean,
    ): T[] {
        out ??= [];
        if (this.objects) {
          if (predicate) out.push(...this.objects.filter(predicate));
          else out.push(...this.objects)
        } else if (this.nodes) {
          if (!predicate || dedupe) predicate = this._makePredicate(predicate);
          for (const node of this.getIndex(obj)) {
            node.retrieve(obj, out, predicate, false)
          }
        } else {
          throw new Error('no nodes or objects!!')
        }
        return out;
    }

    private _makePredicate (original?: (o: T) => boolean): ((o: T) => boolean) {
      const seen = new Set<T>();
      if (original) return (o: T) => {
        if (seen.has(o)) return false;
        seen.add(o);
        return original(o);
      }
      else return (o: T) => {
        if (seen.has(o)) return false;
        seen.add(o);
        return true;

      }
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
    clear(force: boolean = false): void {
      if (force) {
        this.objects = [];
        this.nodes = null;
        this._size = 0;
      } else {
        this.objects = [...this].filter(o => o.qtStatic);
        this.nodes = null;
        this.rebalance();
      }
    }

    rebalance (): void {
        const objects = [...this];
        this.clear(true);
        for (const o of objects) this.insert(o);

        /*
        // I assume this is a cleanup measure?
        for(let i=0; i < this.nodes.length; i++) {
            if(this.nodes.length) {
                this.nodes[i].clear();
            }
        }
        */
    }


    private _size: number = 0;
    get size (): number {
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
    remove(obj:T, consolidate?: boolean): boolean {
      if (this.objects) {
        const index = this.objects.indexOf(obj);
        if (index === -1) return false;
        this._size--;
        this.objects.splice(index, 1);
        return true;
      } else if (this.nodes) {
        let removed = false;
        for (const node of this.getIndex(obj)) {
          removed = node.remove(obj, false) || removed;
        }
        if (removed) {
          this._size--;
          if (consolidate ?? this.size <= this.minObjects) this.consolidate();
        }
        return removed;
      } else {
        return false;
      }
    }

    private removeMultiple (objs: Iterable<T>, consolidate?: boolean): boolean {
      let removed = false;
      for (const o of objs) removed = this.remove(o) || removed;
      if (removed && (consolidate ?? this.size <= this.minObjects))
        this.consolidate();

      return removed;
    }

    // opposite of split
    consolidate (): boolean {
      if (!this.nodes) return false;
      if (this.size <= this.maxObjects) {
        this.objects = [...this];
        this.nodes = null;
        return true;
      }

      let consolidated = false;
      for (const node of this.nodes) {
        consolidated = node.consolidate() || consolidated;
      }
      return consolidated
    }

    /**
     * Iterate over each object in this tree, in no particular order.
     * @param {(o: T) => boolean} [predicate] - an optional function
     */
    * values (predicate?: ((o: T) => boolean), dedupe?: boolean): Generator<T> {
      if (this.objects) {
        // given a set of objects to check for duplicate membership
        if (predicate) for (const o of this.objects) if (predicate(o)) yield o;
        else for (const o of this.objects) yield o;
      } else if (this.nodes) {
        if (!predicate || dedupe) predicate = this._makePredicate(predicate);
        for (const node of this.nodes) {
          for (const o of node.values(predicate, false)) yield o;
        }
      }
    }

    /**
     * Iterate over each object in this tree, in no particular order.
     * Just a convenient way to call .value with no arguments.
     */
    [Symbol.iterator] (): Generator<T> {
      return this.values();
    }
}
