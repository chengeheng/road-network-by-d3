import * as d3 from "d3";
import Layer, { LayerOption } from "./Layer";
interface NameStyleProps {
    color?: string;
    fontWeight?: string | number;
    fontSize?: number;
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
interface NameStyleProps {
    color?: string;
    fontWeight?: string | number;
    fontSize?: number;
}
interface DefaultNameDataProps extends NameStyleProps {
    color: string;
    fontWeight: string | number;
    fontSize: number;
}
interface NameDataProps extends DefaultNameDataProps {
    name: string;
    coordinate: [number, number];
}
interface FormatDataProps {
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number][][];
    };
    properties: {
        option: PolygonOption;
        ids: (string | number)[];
        originData: PolygonDataSource;
        index: number;
        [propName: string]: any;
    };
}
declare class PolygonLayer extends Layer {
    data: PolygonDataSource[];
    option: PolygonOption;
    path: d3.GeoPath<any, any>;
    isHided: boolean;
    nameData: NameDataProps[];
    baseLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    selectLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    hoverLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private clickCount;
    private clickTimer;
    private selectIndex;
    constructor(dataSource: PolygonDataSource[], option?: PolygonLayerOption);
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
    updateData(data: PolygonDataSource[]): void;
    protected draw(): void;
    private combineIndex;
    private drawSelectLayer;
    private drawHoverLayer;
    protected formatData(data: PolygonDataSource[], dataFilter?: (e: polygonItem, idx: number, index: number) => boolean): [FormatDataProps[], NameDataProps[]];
}
export type { PolygonDataSource };
export { PolygonLayer as default, StrokeLineType };
