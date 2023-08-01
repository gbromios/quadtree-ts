import { Quadtree } from '../../src/Quadtree'
import { Rectangle } from '../../src/Rectangle'

describe('Quadtree.clear', () => {
    test('is a function', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        expect(typeof tree.clear).toBe('function')
    })

    test('returns undefined', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        expect(tree.clear()).toBeUndefined()
    })

    test('empties objects', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 })
        tree.insert(rect)
        tree.clear()
        expect(tree.objects).toEqual([])
    })

    test('empties nodes', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        tree.split()
        expect(Array.isArray(tree.nodes)).toBe(true)
        tree.clear()
        expect(tree.nodes).toEqual(null)
    })

    test('leaves qtStatic objects', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        tree.insert(new Rectangle({ x: 0, y: 0, width: 5, height: 5 }))
        tree.insert(
            new Rectangle({ x: 0, y: 0, width: 5, height: 2, qtStatic: true })
        )
        tree.clear()
        expect(tree.objects).toMatchObject([{ qtStatic: true }])
    })

    test('leaves qtStatic objects when force === false', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        tree.insert(new Rectangle({ x: 0, y: 0, width: 5, height: 5 }))
        tree.insert(
            new Rectangle({ x: 0, y: 0, width: 5, height: 2, qtStatic: true })
        )
        tree.clear(false)
        expect(tree.objects).toMatchObject([{ qtStatic: true }])
    })

    test('removes everything when force === true', () => {
        const tree = new Quadtree({ width: 100, height: 100 })
        tree.insert(new Rectangle({ x: 0, y: 0, width: 5, height: 5 }))
        tree.insert(
            new Rectangle({ x: 0, y: 0, width: 5, height: 2, qtStatic: true })
        )
        tree.clear(true)
        expect(tree.objects).toMatchObject([])
    })
})
