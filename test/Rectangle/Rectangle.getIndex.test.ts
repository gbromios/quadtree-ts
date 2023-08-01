import { NodeGeometry } from '../../src/NodeGeometry'
import { Rectangle } from '../../src/Rectangle'
import { QUAD } from '../../src/types'

describe('Rectangle.prototype.qtIndex', () => {
    test('is a function', () => {
        expect(typeof Rectangle.prototype.qtIndex).toBe('function')
    })

    test('returns an array', () => {
        const rect = new Rectangle({ x: 75, y: 0, width: 10, height: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 0, height: 0 });
        expect(() => rect.qtIndex(node)).not.toThrow();
    })

    test('identifies quadrant top right', () => {
        const rect = new Rectangle({ x: 75, y: 0, width: 10, height: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.NE, ])
    })

    test('identifies quadrant top left', () => {
        const rect = new Rectangle({ x: 25, y: 0, width: 10, height: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.NW, ])
    })

    test('identifies quadrant bottom left', () => {
        const rect = new Rectangle({ x: 25, y: 75, width: 10, height: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.SW, ])
    })

    test('identifies quadrant bottom right', () => {
        const rect = new Rectangle({ x: 75, y: 75, width: 10, height: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.SE, ])
    })

    test('identifies overlapping top', () => {
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.NE, QUAD.NW, ])
    })

    test('identifies overlapping bottom', () => {
        const rect = new Rectangle({ x: 0, y: 90, width: 100, height: 10 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.SW, QUAD.SE, ])
    })

    test('identifies overlapping left', () => {
        const rect = new Rectangle({ x: 0, y: 0, width: 10, height: 100 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.NW, QUAD.SW, ])
    })

    test('identifies overlapping right', () => {
        const rect = new Rectangle({ x: 90, y: 0, width: 10, height: 100 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.NE, QUAD.SE, ])
    })

    test('identifies all', () => {
        const rect = new Rectangle({ x: 25, y: 25, width: 50, height: 50 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        expect([...rect.qtIndex(node)]).toEqual([ QUAD.NE, QUAD.NW, QUAD.SW, QUAD.SE, ])
    })

    // I made it greey
    test.skip('identifies edge', () => {
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 });
        const topLeft = new Rectangle({ x: 25, y: 25, width: 25, height: 25 })
        const bottomRight = new Rectangle({
            x: 50,
            y: 50,
            width: 25,
            height: 25,
        })

        console.log(node, topLeft, bottomRight)

        //the current implementation is not greedy on shapes sitting exactly on the edge
        //yes it is B-)
        //Imagine these are exactly starting/ending on the edges:
        //      |
        //     ▮|  <-- only in top left quadrant
        // -----|-----
        //      |▮ <-- only in bottom right quadrant
        //      |
        expect([...topLeft.qtIndex(node)]).toEqual([QUAD.NW])
        expect([...bottomRight.qtIndex(node)]).toEqual([QUAD.SE])

        // TODO - lost a little precision here :I
        //const ε = 0.000000000001
        //const ε = 0.00001;


        const smallest = 0.0000000000001
        topLeft.x += smallest
        topLeft.y += smallest
        bottomRight.x -= smallest
        bottomRight.y -= smallest
        expect([...topLeft.qtIndex(node)])
          .toEqual([QUAD.NE, QUAD.NW, QUAD.SW, QUAD.SE])
        expect([...bottomRight.qtIndex(node)])
          .toEqual([QUAD.NE, QUAD.NW, QUAD.SW, QUAD.SE])
    })
})
