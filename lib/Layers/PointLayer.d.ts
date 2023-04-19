import * as d3 from "d3";
import Layer, { LayerOptionProps } from ".";
import { InitConfigProps } from "../Map";
interface PointLayerOption extends LayerOptionProps {
    icon?: string;
    width?: number;
    height?: number;
    offset?: [number, number];
    rotate?: number;
    hoverColor?: string;
    imageShrink?: boolean;
    tinyIcon?: string;
    useTinyIcon?: boolean;
    tinyIconStyle?: {
        width?: number;
        height?: number;
        offset?: [number, number];
    };
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
    onHover?: Function;
}
interface PointOption extends PointLayerOption {
    icon: string;
    width: number;
    height: number;
    offset: [number, number];
    rotate: number;
    tinyIcon: string;
    useTinyIcon: boolean;
    tinyIconStyle: {
        width: number;
        height: number;
        offset: [number, number];
    };
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
    onHover: Function;
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
    private _mapConfig;
    private _imageShrink;
    private _hover;
    constructor(dataSource: PointDataSourceProps[], option?: PointLayerOption);
    private _initState;
    private _combineOption;
    private _drawWithHoverColor;
    private _drawWithOutHoverColor;
    private _formatData;
    private _makeFilterMatrix;
    private _hexToRgb;
    protected _draw(): void;
    init(g: SVGGElement, projection: d3.GeoProjection, config: InitConfigProps): void;
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
    updateMapConfig(config: InitConfigProps): void;
}
export type { PointDataSourceProps };
export default PointLayer;
