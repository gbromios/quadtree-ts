import type { ObjectsType } from './types'
//import { Quadrant } from './types';
import { Quadtree } from './Quadtree'

export type Subtree<T extends ObjectsType = ObjectsType> = {
    //readonly [Q in Quadrant]: Quadtree<T>
    [key: number]: Quadtree<T> // smh
} & {
    [Symbol.iterator](): Iterator<Quadtree<T>>
}

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

export function Subtree<T extends ObjectsType>(root: Quadtree<T>): Subtree<T> {
    const width = root.bounds.width / 2
    const height = root.bounds.height / 2
    const x = root.bounds.x
    const y = root.bounds.y

    const level = root.level + 1
    const props = {
        width,
        height,
        maxObjects: root.maxObjects,
        maxLevels: root.maxLevels,
    }
    return Object.freeze([
        new Quadtree({ x: x + width, y: y, ...props }, level),
        new Quadtree({ x: x, y: y, ...props }, level),
        new Quadtree({ x: x, y: y + height, ...props }, level),
        new Quadtree({ x: x + width, y: y + height, ...props }, level),
    ] as Subtree<T>)
}
