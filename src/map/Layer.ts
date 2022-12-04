import * as d3 from "d3";

enum LayerType {
	PointLayer,
	PolygonLayer,
	PolyLineLayer,
}

interface LayerOption {}

const defaultOption: LayerOption = {};

class Layer {
	type: LayerType; // 图层类型
	projection: d3.GeoProjection; // 映射
	map!: SVGGElement; // 地图实例
	container!: d3.Selection<SVGGElement, unknown, null, undefined>; // 图层容器实例

	constructor(type: LayerType, options = defaultOption) {
		this.type = type;
		this.projection = d3.geoMercator();
	}

	init(g: SVGGElement, projection: d3.GeoProjection) {
		this.map = g;
		this.projection = projection;
	}

	remove() {}
	updateData(data: any) {}
}

export type { LayerOption };
export { Layer as default, LayerType };
