import * as d3 from "d3";

import { InitConfigProps } from "../Map";

enum LayerType {
	PointLayer,
	PolygonLayer,
	PolyLineLayer,
}

interface LayerOptionProps {}

const defaultOption: LayerOptionProps = {};

class Layer {
	type: LayerType; // 图层类型
	projection: d3.GeoProjection; // 映射
	map!: SVGGElement; // 地图元素实例-最外层标签
	container!: d3.Selection<SVGGElement, unknown, null, undefined>; // 图层容器实例

	constructor(type: LayerType, options = defaultOption) {
		this.type = type;
		this.projection = d3.geoMercator();
	}

	init(g: SVGGElement, projection: d3.GeoProjection, option: InitConfigProps) {
		this.map = g;
		this.projection = projection;
	}

	remove() {}
	updateData(data: any) {}
	// 显示和隐藏图层
	show() {}
	hide() {}

	// 打开和关系图层所有功能，只做展示使用
	enableLayerFunc() {}
	disableLayerFunc() {}

	// 更新地图的全局配置
	updateMapConfig(config: InitConfigProps) {}

	protected makeRandomId(): string {
		const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
		/****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		const maxPos = chars.length;
		let code = "";
		for (let i = 0; i < 6; i++) {
			code += chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return code;
	}

	protected calcuteTextWidth(text: string, fontSize = "12px") {
		let span = document.getElementById("__getwidth");
		if (!span) {
			span = document.createElement("span");
		}
		span.id = "__getwidth";
		span.style.visibility = "hidden";
		span.style.fontSize = fontSize;
		span.style.whiteSpace = "nowrap";
		span.innerText = text;
		document.body.appendChild(span);
		const width = span.offsetWidth;
		const height = span.offsetHeight;
		document.body.removeChild(span);
		return [width, height];
	}
}

export type { LayerOptionProps };
export { Layer as default, LayerType };
