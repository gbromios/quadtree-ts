import { Line } from '../../src/Line'
import { NodeGeometry } from '../../src/NodeGeometry'
import { QUAD } from '../../src/types'

describe('Line.prototype.qtIndex', () => {
    test('is a function', () => {
        expect(typeof Line.prototype.qtIndex).toBe('function')
    })

    test('returns an array', () => {
        const line = new Line({ x1: 20, y1: 40, x2: 100, y2: 200 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect(() => [...line.qtIndex(node)]).not.toThrow()
    })

    test('identifies quadrant top right', () => {
        const line = new Line({ x1: 75, y1: 25, x2: 80, y2: 30 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.NE])
    })

    test('identifies quadrant top left', () => {
        const line = new Line({ x1: 25, y1: 25, x2: 30, y2: 30 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.NW])
    })

    test('identifies quadrant bottom left', () => {
        const line = new Line({ x1: 25, y1: 75, x2: 30, y2: 80 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.SW])
    })

    test('identifies quadrant bottom right', () => {
        const line = new Line({ x1: 75, y1: 75, x2: 80, y2: 80 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.SE])
    })

    test('identifies overlapping top', () => {
        const line = new Line({ x1: 25, y1: 25, x2: 75, y2: 25 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toMatchObject([QUAD.NW, QUAD.NE])
    })

    test('identifies overlapping bottom', () => {
        const line = new Line({ x1: 25, y1: 75, x2: 75, y2: 75 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.SE, QUAD.SW])
    })

    test('identifies overlapping left', () => {
        const line = new Line({ x1: 25, y1: 25, x2: 25, y2: 75 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.NW, QUAD.SW])
    })

    test('identifies overlapping right', () => {
        const line = new Line({ x1: 75, y1: 25, x2: 75, y2: 75 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.NE, QUAD.SE])
    })

    test('identifies diagonal /', () => {
        const line = new Line({ x1: 25, y1: 75, x2: 75, y2: 25 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.NE, QUAD.SW])
    })

    test('identifies diagonal \\', () => {
        const line = new Line({ x1: 25, y1: 25, x2: 75, y2: 75 })
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        expect([...line.qtIndex(node)]).toEqual([QUAD.NW, QUAD.SE])
    })

    /**
     * @todo
     * @remarks
     * There is a bug where detection fails on corner intersections
     * when the line enters/exits the node exactly at corners (45°)
     * {@link https://stackoverflow.com/a/18292964/860205}
     */
    // test('identifies diagonal / overstretch', () => {
    //     const line = new Line({ x1: 125, y1: -25, x2: -25, y2: 125 });
    //     expect(line.qtIndex({x: 0, y: 0, width: 100, height: 100})).toEqual([QUAD.NE, QUAD.SW]);
    // });

    // test('identifies diagonal \\ overstretch', () => {
    //     const line = new Line({ x1: -25, y1: -25, x2: 125, y2: 125 });
    //     expect(line.qtIndex({x: 0, y: 0, width: 100, height: 100})).toEqual([1, QUAD.SE]);
    // });

    test('identifies edge', () => {
        const node = NodeGeometry({ x: 0, y: 0, width: 100, height: 100 })
        const topLeft = new Line({ x1: 25, y1: 25, x2: 50, y2: 50 })
        const bottomRight = new Line({ x1: 50, y1: 50, x2: 75, y2: 75 })

        //the current implementation is not greedy on shapes sitting exactly on the edge
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
        const ε = 0.00001
        topLeft.x2 += ε
        topLeft.y2 += ε
        bottomRight.x1 -= ε
        bottomRight.y1 -= ε
        expect([...topLeft.qtIndex(node)]).toEqual([QUAD.NW, QUAD.SE])
        expect([...bottomRight.qtIndex(node)]).toEqual([QUAD.NW, QUAD.SE])
    })
})
