import { Circle } from '../../src/Circle'
import { NodeGeometry } from '../../src/NodeGeometry'
import { QUAD } from '../../src/types'

describe('Circle.prototype.qtIndex', () => {
    test('is a function', () => {
        expect(typeof Circle.prototype.qtIndex).toBe('function')
    })

    test('returns an array', () => {
        const circle = new Circle({ x: 20, y: 40, r: 100 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect(() => [...circle.qtIndex(node)]).not.toThrow();
    })

    test('identifies quadrant top right', () => {
        const circle = new Circle({ x: 75, y: 25, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.NE])
    })

    test('identifies quadrant top left', () => {
        const circle = new Circle({ x: 25, y: 25, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.NW])
    })

    test('identifies quadrant bottom left', () => {
        const circle = new Circle({ x: 25, y: 75, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.SW])
    })

    test('identifies quadrant bottom right', () => {
        const circle = new Circle({ x: 75, y: 75, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.SE])
    })

    test('identifies overlapping top', () => {
        const circle = new Circle({ x: 50, y: 25, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.NW, QUAD.NE]) })
    test('identifies overlapping bottom', () => {
        const circle = new Circle({ x: 50, y: 75, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.SE, QUAD.SW])
    })

    test('identifies overlapping left', () => {
        const circle = new Circle({ x: 25, y: 50, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.NW, QUAD.SW])
    })

    test('identifies overlapping right', () => {
        const circle = new Circle({ x: 75, y: 50, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.NE, QUAD.SE])
    })

    test('identifies all', () => {
        const circle = new Circle({ x: 50, y: 50, r: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...circle.qtIndex(node)]).toEqual( [QUAD.NW, QUAD.NE, QUAD.SE, QUAD.SW])
    })

    // its greedy now i guess
    test.skip('identifies edge', () => {
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        const topLeft = new Circle({ x: 25, y: 25, r: 25 })
        const bottomRight = new Circle({ x: 75, y: 75, r: 25 })

        //the current implementation is not greedy on shapes sitting exactly on the edge
        //Imagine these are exactly starting/ending on the edges:
        //      |
        //     ▮|  <-- only in top left quadrant
        // -----|-----
        //      |▮ <-- only in bottom right quadrant
        //      |

        expect([...topLeft.qtIndex(node)]).toEqual([QUAD.NW])
        expect([...bottomRight.qtIndex(node)]).toEqual([QUAD.SE])

        const smallest = 0.0000000000001
        topLeft.x += smallest
        topLeft.y += smallest
        bottomRight.x -= smallest
        bottomRight.y -= smallest
        expect([...topLeft.qtIndex(node)]).toEqual([QUAD.NE, QUAD.NW, QUAD.SW])
        expect([...bottomRight.qtIndex(node)]).toEqual([QUAD.NE, QUAD.SW, QUAD.SE])
    })
})
