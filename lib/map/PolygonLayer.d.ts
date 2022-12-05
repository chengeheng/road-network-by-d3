import * as d3 from "d3";
import Layer, { LayerOption } from "./Layer";
type polygonItem = {
    id: string | number;
    coordinates: [number, number][];
    reverseCoords?: [number, number][];
    [propName: string]: any;
};
declare enum StrokeLineType {
    dotted = "dotted",
    solid = "solid"
}
interface PolygonLayerOption extends LayerOption {
    strokeColor?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeType?: StrokeLineType;
    strokeDashArray?: number[];
    fillColor?: string;
    fillOpacity?: number;
    selectColor?: string;
    selectable?: boolean;
    hoverColor?: string;
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
}
interface PolygonOption extends PolygonLayerOption {
    strokeColor: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeType: StrokeLineType;
    strokeDashArray: number[];
    fillColor: string;
    fillOpacity: number;
    selectColor: string;
    selectable: boolean;
    hoverColor: string;
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
}
interface PolygonDataSource {
    data: polygonItem[];
    option?: PolygonLayerOption;
}
declare class PolygonLayer extends Layer {
    data: PolygonDataSource[];
    option: PolygonOption;
    path: d3.GeoPath<any, any>;
    isHided: boolean;
    baseLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    selectLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    hoverLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private clickCount;
    private clickTimer;
    private selectIndexs;
    constructor(dataSource: PolygonDataSource[], option?: PolygonLayerOption);
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
    updateData(data: PolygonDataSource[]): void;
    protected draw(): void;
    drawSelectLayer(coords: [number, number][][], properties: {
        [propName: string]: any;
        option: PolygonOption;
        originData: PolygonDataSource;
        ids: (string | number)[];
    }): void;
    drawHoverLayer(coords: [number, number][][], properties: {
        [propName: string]: any;
        option: PolygonOption;
        ids: (string | number)[];
        originData: PolygonDataSource;
    }): void;
    formatData(data: PolygonDataSource[]): {
        type: string;
        geometry: {
            type: string;
            coordinates: [number, number][][];
        };
        properties: {
            [propName: string]: any;
            option: PolygonOption;
            ids: (string | number)[];
            originData: PolygonDataSource;
        };
    }[];
}
export type { PolygonDataSource };
export { PolygonLayer as default, StrokeLineType };
