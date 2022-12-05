import * as d3 from "d3";
import Layer, { LayerOption } from "./Layer";
type polyLineItem = {
    id: string | number;
    coordinates: [number, number][];
    [propName: string]: any;
};
declare enum StrokeLineType {
    dotted = "dotted",
    solid = "solid"
}
interface PolyLineLayerOption extends LayerOption {
    strokeColor?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeType?: StrokeLineType;
    strokeDashArray?: number[];
    selectColor?: string;
    selectable?: boolean;
    hoverColor?: string;
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
}
interface PolyLineOption extends PolyLineLayerOption {
    strokeColor: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeType: StrokeLineType;
    strokeDashArray: number[];
    selectColor: string;
    selectable: boolean;
    hoverColor: string;
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
}
interface PolyLineDataSource {
    data: polyLineItem[];
    option?: PolyLineLayerOption;
}
declare class PolyLineLayer extends Layer {
    data: PolyLineDataSource[];
    option: PolyLineOption;
    path: d3.GeoPath<any, any>;
    baseLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    selectLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    hoverLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private clickCount;
    private clickTimer;
    private selectIndexs;
    constructor(dataSource: PolyLineDataSource[], option?: PolyLineLayerOption);
    init(svg: SVGGElement, projection: d3.GeoProjection): void;
    remove(): void;
    /**
     * 显示当前图层
     */
    show(): void;
    /**
     * 隐藏当前图层
     */
    hide(): void;
    updateData(data: PolyLineDataSource[]): void;
    protected draw(): void;
    drawSelectLayer(coords: [number, number][][], properties: {
        [propName: string]: any;
        option: PolyLineOption;
        originData: PolyLineDataSource;
        ids: (string | number)[];
    }): void;
    drawHoverLayer(coords: [number, number][][], properties: {
        [propName: string]: any;
        option: PolyLineOption;
        ids: (string | number)[];
        originData: PolyLineDataSource;
    }): void;
    formatData(data: PolyLineDataSource[]): {
        type: string;
        geometry: {
            type: string;
            coordinates: [number, number][][];
        };
        properties: {
            [propName: string]: any;
            option: PolyLineOption;
            ids: (string | number)[];
            originData: PolyLineDataSource;
        };
    }[];
    private isPointInLine;
}
export type { PolyLineDataSource };
export { PolyLineLayer as default, StrokeLineType };
