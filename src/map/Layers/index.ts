import Layer, { LayerOptionProps, LayerType } from "./Layer";
import LabelLayer, { LabelDataSourceProps } from "./LabelLayer";
import PointLayer, { PointDataSourceProps } from "./PointLayer";
import PolygonLayer, {
	PolygonDataSourceProps,
	StrokeLineType,
} from "./PolygonLayer";
import PolyLineLayer, { PolyLineDataSourceProps } from "./PolyLineLayer";

export type {
	LayerOptionProps,
	LabelDataSourceProps,
	PointDataSourceProps,
	PolygonDataSourceProps,
	PolyLineDataSourceProps,
};
export {
	Layer as default,
	LayerType,
	LabelLayer,
	PointLayer,
	PolygonLayer,
	PolyLineLayer,
	StrokeLineType,
};
