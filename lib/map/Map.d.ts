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
    private zoom;
    private zoomLevel;
    private layers;
    projection: d3.GeoProjection;
    constructor(id: string, options?: MapOption);
    private init;
    addLayer(layer: Layer): void;
    removeLayer(layer: Layer): void;
    showLayer(): void;
    hideLayer(): void;
    /**
     * 移动到指定点位
     * @param coord 点位bd09坐标
     * @param zoomLevel 地图缩放层级
     */
    moveTo(coord: [number, number], zoomLevel?: number): void;
    /**
     * 移动到某个区域的最佳视图
     * @param coords 坐标数组
     * @returns
     */
    focusOnView(coords: [number, number][]): void;
}
export default Map;
