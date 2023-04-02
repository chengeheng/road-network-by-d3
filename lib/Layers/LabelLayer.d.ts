import * as d3 from "d3";
import Layer, { LayerOptionProps } from ".";
import { InitConfigProps } from "../Map";
interface StyleProps {
    color?: string;
    fontWeight?: string;
    fontSize?: number;
    strokeColor?: string;
    strokeWidth?: number;
}
interface LabelLayerOptionProps extends LayerOptionProps {
    style?: StyleProps;
    rotate?: number;
    offset?: [number, number];
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
}
interface LabelDataSourceProps {
    name: string;
    coordinate: [number, number];
    id: string | number;
    option?: LabelLayerOptionProps;
}
declare class LabelLayer extends Layer {
    private _clickCount;
    private _clickTimer;
    private _baseLayer;
    private _option;
    data: LabelDataSourceProps[];
    isHided: boolean;
    constructor(dataSource: LabelDataSourceProps[], option?: LabelLayerOptionProps);
    private _combineOption;
    private _initState;
    private _formatData;
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
    updateData(data: LabelDataSourceProps[]): void;
    protected _draw(): void;
}
export type { LabelDataSourceProps };
export default LabelLayer;
