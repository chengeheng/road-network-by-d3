import * as d3 from "d3";
import Layer, { LayerOptionProps } from ".";
type polyLineItem = {
    id: string | number;
    coordinates: [number, number][];
    [propName: string]: any;
};
declare enum StrokeLineType {
    dotted = "dotted",
    solid = "solid"
}
interface StyleProps {
    strokeColor?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeType?: StrokeLineType;
    strokeDashArray?: number[];
}
interface PolyLineLayerOptionProps extends LayerOptionProps {
    style?: StyleProps;
    selectStyle?: StyleProps;
    hoverStyle?: StyleProps;
    selectable: boolean;
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
    selectType?: "link" | "path" | "all";
}
interface PolyLineDataSourceProps {
    data: polyLineItem[];
    option?: PolyLineLayerOptionProps;
}
interface _PolyLineOptionProps {
    style: {
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
        strokeType: StrokeLineType;
        strokeDashArray: number[];
    };
    selectStyle: {
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
        strokeType: StrokeLineType;
        strokeDashArray: number[];
    };
    hoverStyle: {
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
        strokeType: StrokeLineType;
        strokeDashArray: number[];
    };
    hasHover: boolean;
    selectable: boolean;
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
    selectType: "link" | "path" | "all";
}
declare class PolyLineLayer extends Layer {
    data: PolyLineDataSourceProps[];
    option: _PolyLineOptionProps;
    path: d3.GeoPath<any, any>;
    length: number;
    private _baseLayer;
    private _selectLayer;
    private _hoverLayer;
    private _clickCount;
    private _clickTimer;
    private _selectIndex;
    private _hoverIndex;
    private _selectType;
    private _allIndex;
    constructor(dataSource: PolyLineDataSourceProps[], option?: PolyLineLayerOptionProps);
    private _combineOption;
    protected _draw(): void;
    private _drawSelectLayer;
    private _drawHoverLayer;
    private _formatData;
    private combineIndex;
    private _insideInStandardRect;
    private _insideInRect;
    private _isPointInLine;
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
    updateData(data: PolyLineDataSourceProps[]): void;
    setSelectType(type: "link" | "path" | "all"): void;
}
export type { PolyLineDataSourceProps };
export { PolyLineLayer as default, StrokeLineType };
