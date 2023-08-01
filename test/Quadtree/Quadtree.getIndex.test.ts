import { Quadtree } from '../../src/Quadtree'
import { Rectangle } from '../../src/Rectangle'

describe('Quadtree.getIndex', () => {
    test('is a function', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        expect(typeof tree.getIndex).toBe('function')
    })

    test('returns an iterable of sub-tree without any nodes', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 })
        expect([...tree.retrieve(rect)]).toEqual([])
    })
    test('returns an iterable of sub-tree', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 })
        tree.insert(rect)
        tree.split()
        expect([...tree.getIndex(rect)]).toEqual([...tree.nodes!])
    })
})
