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
interface PointDataSource {
    id: string | number;
    coordinate: [number, number];
    name?: string;
    icon?: string;
    option?: PointLayerOption;
}
declare class PointLayer extends Layer {
    data: PointDataSource[];
    option: PointOption;
    isHided: boolean;
    baseLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private clickCount;
    private clickTimer;
    private filterIds;
    constructor(dataSource: PointDataSource[], option?: PointLayerOption);
    private initState;
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
    updateData(data: PointDataSource[]): void;
    protected draw(): void;
    private drawWithHoverColor;
    private drawWithOutHoverColor;
    private formatData;
    private makeFilterMatrix;
    private hexToRgb;
}
export type { PointDataSource };
export default PointLayer;
