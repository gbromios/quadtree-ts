import { NodeGeometry } from './NodeGeometry';
import type { Rectangle } from './Rectangle';
import type { Circle } from './Circle';
import type { Line } from './Line';
export declare type Quadrant = number;
export declare const enum QUAD {
    NE = 0,
    NW = 1,
    SW = 2,
    SE = 3
}
/**
 * All shape classes must implement this interface.
 */
export interface Indexable {
    /**
     * Whether this object should be removed during a typical .clear call
     */
    qtStatic?: boolean;
    /**
     * This method is called on all objects that are inserted into or retrieved from the Quadtree.
     * It must determine which quadrant an object belongs to.
     * @param node - Quadtree node to be checked
     * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right)
     */
    qtIndex(node: NodeGeometry): Iterable<Quadrant>;
}
export declare type ObjectsType = Rectangle | Circle | Line | Indexable;
