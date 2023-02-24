import * as d3 from "d3";
declare enum LayerType {
    PointLayer = 0,
    PolygonLayer = 1,
    PolyLineLayer = 2
}
interface LayerOptionProps {
}
declare class Layer {
    type: LayerType;
    projection: d3.GeoProjection;
    map: SVGGElement;
    container: d3.Selection<SVGGElement, unknown, null, undefined>;
    constructor(type: LayerType, options?: LayerOptionProps);
    init(g: SVGGElement, projection: d3.GeoProjection): void;
    remove(): void;
    updateData(data: any): void;
    show(): void;
    hide(): void;
    enableLayerFunc(): void;
    disableLayerFunc(): void;
    protected makeRandomId(): string;
    protected calcuteTextWidth(text: string, fontSize?: string): number[];
}
export type { LayerOptionProps };
export { Layer as default, LayerType };
