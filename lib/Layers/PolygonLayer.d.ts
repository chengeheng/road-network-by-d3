import * as d3 from "d3";
import Layer, { LayerOptionProps } from ".";
import { InitConfigProps } from "../Map";
interface NameStyleProps {
    color?: string;
    fontWeight?: string | number;
    fontSize?: number;
    rotate?: number;
}
type polygonItem = {
    id: string | number;
    coordinates: [number, number][];
    reverseCoords?: [number, number][];
    name?: string;
    nameStyle?: NameStyleProps;
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
    fillColor?: string;
    fillOpacity?: number;
}
interface PolygonLayerOptionProps extends LayerOptionProps {
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
interface _PolygonOptionProps {
    style: {
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
        strokeType: StrokeLineType;
        strokeDashArray: number[];
        fillColor: string;
        fillOpacity: number;
    };
    selectStyle: {
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
        strokeType: StrokeLineType;
        strokeDashArray: number[];
        fillColor: string;
        fillOpacity: number;
    };
    hoverStyle: {
        strokeColor: string;
        strokeWidth: number;
        strokeOpacity: number;
        strokeType: StrokeLineType;
        strokeDashArray: number[];
        fillColor: string;
        fillOpacity: number;
    };
    hasHover: boolean;
    selectable: boolean;
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
    selectType: "link" | "path" | "all";
}
interface PolygonDataSourceProps {
    data: polygonItem[];
    option?: PolygonLayerOptionProps;
}
declare class PolygonLayer extends Layer {
    data: PolygonDataSourceProps[];
    option: _PolygonOptionProps;
    path: d3.GeoPath<any, any>;
    isHided: boolean;
    length: number;
    private _baseLayer;
    private _selectLayer;
    private _hoverLayer;
    private clickCount;
    private clickTimer;
    private selectIndex;
    private _hoverIndex;
    private _selectType;
    private _allIndex;
    constructor(dataSource: PolygonDataSourceProps[], option?: PolygonLayerOptionProps);
    private _combineOption;
    private _combineIndex;
    private _drawSelectLayer;
    private _drawHoverLayer;
    private _formatData;
    protected _draw(): void;
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
    updateData(data: PolygonDataSourceProps[]): void;
    setSelectType(type: "link" | "path" | "all"): void;
}
export type { PolygonDataSourceProps };
export { PolygonLayer as default, StrokeLineType };
