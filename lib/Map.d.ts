import * as d3 from "d3";
import Layer from "./Layers";
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
    /**
     * 添加图层
     * @param layer 图层实例
     */
    addLayer(layer: Layer): void;
    /**
     * 删除图层
     * @param layer 图层实例
     */
    removeLayer(layer: Layer): void;
    /**
     * 显示指定的或所有隐藏的图层
     * @param layer 图层
     */
    showLayer(layer?: Layer): void;
    /**
     * 隐藏指定的或所有图层
     * @param layer 图层
     */
    hideLayer(layer?: Layer): void;
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
