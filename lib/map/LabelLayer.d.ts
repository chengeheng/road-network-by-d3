import * as d3 from "d3";
import Layer, { LayerOption } from "./Layer";
interface LabelItemOptionProps extends LayerOption {
    rotate?: number;
    offset?: [number, number];
    stopPropagation?: boolean;
    onClick?: Function;
    onRightClick?: Function;
    onDbClick?: Function;
}
interface LabelOptionProps extends LabelItemOptionProps {
    rotate: number;
    offset: [number, number];
    stopPropagation: boolean;
    onClick: Function;
    onRightClick: Function;
    onDbClick: Function;
}
interface StyleProps {
    color?: string;
    fontWeight?: string;
    fontSize?: number;
    strokeColor?: string;
    strokeWidth?: number;
}
interface LabelDataSourceProps {
    name: string;
    coordinate: [number, number];
    id: string | number;
    option?: LabelItemOptionProps;
    style?: StyleProps;
    hoverStyle?: StyleProps;
    selectStyle?: StyleProps;
}
declare class LabelLayer extends Layer {
    private _clickCount;
    private _clickTimer;
    private _filterIds;
    private _baseLayer;
    data: LabelDataSourceProps[];
    option: LabelOptionProps;
    isHided: boolean;
    constructor(dataSource: LabelDataSourceProps[], option?: LabelItemOptionProps);
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
    updateData(data: LabelDataSourceProps[]): void;
    protected _draw(): void;
    private formatData;
}
export type { LabelDataSourceProps };
export default LabelLayer;
