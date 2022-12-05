import * as d3 from "d3";
import Layer, { LayerOption } from "./Layer";
interface PointLayerOption extends LayerOption {
    icon?: string;
    width?: number;
    height?: number;
    offset?: [number, number];
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
    constructor(dataSource: PointDataSource[], option?: PointLayerOption);
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
    updateData(data: PointDataSource[]): void;
    protected draw(): void;
    formatData(data: PointDataSource[]): {
        coordinate: [number, number];
        icon: string;
        option: {
            icon: string;
            width: number;
            height: number;
            offset: [number, number];
            stopPropagation: boolean;
            onClick: Function;
            onRightClick: Function;
            onDbClick: Function;
        };
        id: string | number;
        name?: string | undefined;
    }[];
    private calcuteTextWidth;
}
export type { PointDataSource };
export default PointLayer;
