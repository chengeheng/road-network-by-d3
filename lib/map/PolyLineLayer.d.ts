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
    selectType?: "link" | "path" | "all";
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
    selectType: "link" | "path" | "all";
}
interface PolyLineDataSource {
    data: polyLineItem[];
    option?: PolyLineLayerOption;
}
declare class PolyLineLayer extends Layer {
    data: PolyLineDataSource[];
    option: PolyLineOption;
    path: d3.GeoPath<any, any>;
    length: number;
    baseLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    selectLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    hoverLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private clickCount;
    private clickTimer;
    private selectIndex;
    private _hoverIndex;
    private _selectType;
    private _allIndex;
    constructor(dataSource: PolyLineDataSource[], option?: PolyLineLayerOption);
    init(g: SVGGElement, projection: d3.GeoProjection): void;
    remove(): void;
    /**
     * 显示当前图层
     */
    show(): void;
    /**
     * 隐藏当前图层
     */
    hide(): void;
    enableLayerFunc(): void;
    disableLayerFunc(): void;
    updateData(data: PolyLineDataSource[]): void;
    setSelectType(type: "link" | "path" | "all"): void;
    protected draw(): void;
    drawSelectLayer(): void;
    private drawHoverLayer;
    private formatData;
    private combineIndex;
    private isPointInLine;
}
export type { PolyLineDataSource };
export { PolyLineLayer as default, StrokeLineType };
