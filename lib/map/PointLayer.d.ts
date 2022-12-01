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
    baseLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private clickCount;
    private clickTimer;
    constructor(dataSource: PointDataSource[], option?: PointLayerOption);
    init(svg: SVGGElement, projection: d3.GeoProjection): void;
    remove(): void;
    show(): void;
    hide(): void;
    updateData(data: PointDataSource[]): void;
    draw(): void;
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
}
export type { PointDataSource };
export default PointLayer;
