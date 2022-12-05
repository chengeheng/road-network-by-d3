import * as d3 from "d3";
declare enum LayerType {
    PointLayer = 0,
    PolygonLayer = 1,
    PolyLineLayer = 2
}
interface LayerOption {
}
declare class Layer {
    type: LayerType;
    projection: d3.GeoProjection;
    map: SVGGElement;
    container: d3.Selection<SVGGElement, unknown, null, undefined>;
    constructor(type: LayerType, options?: LayerOption);
    init(g: SVGGElement, projection: d3.GeoProjection): void;
    remove(): void;
    updateData(data: any): void;
}
export type { LayerOption };
export { Layer as default, LayerType };
