import type { ObjectsType } from './types';
import { Quadtree } from './Quadtree';
export declare type Subtree<T extends ObjectsType = ObjectsType> = {
    [key: number]: Quadtree<T>;
} & {
    [Symbol.iterator](): Iterator<Quadtree<T>>;
};
export declare function Subtree<T extends ObjectsType>(root: Quadtree<T>): Subtree<T>;
