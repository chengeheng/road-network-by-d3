import * as d3 from "d3";
import Layer from "./Layer";
interface MapOption {
    center?: [number, number];
    class?: string;
    onClick?: Function;
    [propName: string]: any;
}
declare class Map {
    private id;
    private container;
    private map;
    private width;
    private height;
    private svg;
    private options;
    private layers;
    projection: d3.GeoProjection;
    constructor(id: string, options?: MapOption);
    private init;
    addLayer(layer: Layer): void;
    removeLayer(layer: Layer): void;
    showLayer(): void;
    hideLayer(): void;
}
export default Map;
