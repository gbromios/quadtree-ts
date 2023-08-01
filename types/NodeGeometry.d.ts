import { vec2 } from 'gl-matrix';
declare type NodeGeometryProps = {
    x?: number;
    y?: number;
    width: number;
    height: number;
};
/**
 * Interface for geometry of a Quadtree node
 */
export interface NodeGeometry {
    /**
     * X position of the node
     */
    x: number;
    /**
     * Y position of the node
     */
    y: number;
    /**
     * Width of the node
     */
    width: number;
    /**
     * Height of the node
     */
    height: number;
    /**
     * X,Y position vector of the node
     */
    readonly position: vec2;
    /**
     * Width, Height size vector of the node
     */
    readonly size: vec2;
    /**
     * X,Y position vector of the node
     */
    center(): Readonly<vec2>;
    center(out: vec2): vec2;
}
export declare function NodeGeometry(props: NodeGeometryProps): NodeGeometry;
export declare function NodeGeometry(position: vec2, size: vec2): NodeGeometry;
export {};
