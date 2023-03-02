import * as d3 from "d3";
import Layer, { LayerOptionProps } from ".";
interface PointLayerOption extends LayerOptionProps {
    icon?: string;
    width?: number;
    height?: number;
    offset?: [number, number];
    rotate?: number;
    hoverColor?: string;
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
}
interface PointOption extends PointLayerOption {
    icon: string;
    width: number;
    height: number;
    offset: [number, number];
    rotate: number;
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
}
interface PointDataSourceProps {
    id: string | number;
    coordinate: [number, number];
    name?: string;
    icon?: string;
    option?: PointLayerOption;
}
declare class PointLayer extends Layer {
    data: PointDataSourceProps[];
    option: PointOption;
    isHided: boolean;
    baseLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private clickCount;
    private clickTimer;
    private filterIds;
    constructor(dataSource: PointDataSourceProps[], option?: PointLayerOption);
    private _initState;
    private _drawWithHoverColor;
    private drawWithOutHoverColor;
    private _formatData;
    private _makeFilterMatrix;
    private _hexToRgb;
    protected _draw(): void;
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
    updateData(data: PointDataSourceProps[]): void;
}
export type { PointDataSourceProps };
export default PointLayer;
