import * as d3 from "d3";
import Layer, { LayerOptionProps } from ".";
import { InitConfigProps } from "../Map";
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
    shrink?: boolean;
    selectable?: boolean;
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
    onHover?: Function;
    onLeave?: Function;
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
    shrink: boolean;
    hasHover: boolean;
    selectable: boolean;
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
    onHover: Function;
    onLeave: Function;
    selectType: "link" | "path" | "all";
}
interface _DrawParameterProps {
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number][][];
    };
    properties: {
        option: _PolyLineOptionProps;
        ids: (string | number)[];
        originData: PolyLineDataSourceProps;
        [propName: string]: any;
    };
}
declare class PolyLineLayer extends Layer {
    data: PolyLineDataSourceProps[];
    option: _PolyLineOptionProps;
    path: d3.GeoPath<any, any>;
    length: number;
    private _baseLayer;
    private _selectLayer;
    private _hoverLayer;
    private _shrink;
    private _clickCount;
    private _clickTimer;
    private _selectIndex;
    private _hoverIndex;
    private _selectType;
    private _allIndex;
    private _hover;
    private _mapConfig;
    constructor(dataSource: PolyLineDataSourceProps[], option?: PolyLineLayerOptionProps);
    private _combineOption;
    protected _draw(): d3.Selection<SVGPathElement, _DrawParameterProps, SVGGElement, unknown>;
    private _formatReturnedData;
    private _drawSelectLayer;
    private _drawHoverLayer;
    private _formatData;
    private combineIndex;
    private _insideInStandardRect;
    private _insideInRect;
    private _isPointInLine;
    init(g: SVGGElement, projection: d3.GeoProjection, option: InitConfigProps): void;
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
    updateMapConfig(config: InitConfigProps): void;
}
export type { PolyLineDataSourceProps };
export { PolyLineLayer as default, StrokeLineType };
