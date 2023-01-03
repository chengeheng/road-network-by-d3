import * as d3 from "d3";
import Layer from "./Layer";

interface MapOption {
	center?: [number, number];
	class?: string;
	onClick?: Function;
	[propName: string]: any;
}

interface MapOptionType extends MapOption {
	center: [number, number];
	onClick: Function;
}

const defaultOptions: MapOptionType = {
	center: [118.39067530252157, 31.343146080447582],
	onClick: () => {},
};

class Map {
	private id: string;
	private container: HTMLElement;
	private map!: SVGGElement;
	private width: number;
	private height: number;
	private svg!: SVGSVGElement;
	private options: MapOptionType;
	private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;
	private zoomLevel: number;
	private defaultConfig: object;

	private layers: Layer[];

	projection: d3.GeoProjection;

	constructor(id: string, options: MapOption = defaultOptions) {
		// 初始化值
		this.id = id;
		this.width = 0;
		this.height = 0;
		this.layers = [];
		this.zoomLevel = 1;
		this.defaultConfig = {};

		this.projection = d3.geoMercator();

		const container = document.getElementById(this.id);
		if (container === null) {
			throw Error("地图容器的id不能为空");
		} else {
			this.container = container;

			const option = { ...defaultOptions, ...options };
			this.options = option;
			const rect = container.getBoundingClientRect();
			this.width = rect.width;
			this.height = rect.height;
			this.projection = d3
				.geoMercator()
				.scale(30000000)
				.center(option.center!)
				.translate([rect.width / 2, rect.height / 2]);

			this.init();
			const resizeObserver = new ResizeObserver(e => {
				const rect = container.getBoundingClientRect();
				this.width = rect.width;
				this.height = rect.height;
				d3.select(this.svg)
					.attr("width", rect.width)
					.attr("height", rect.height);
			});
			resizeObserver.observe(container);
		}
	}
	//  初始化地图
	private init() {
		const container = d3.select(this.container);
		container.select("svg").remove();

		const svg = container
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.style("cursor", "pointer");
		if (this.options.class) {
			svg.attr("class", this.options.class);
		}
		const g = svg.append("g");
		this.map = g.node()!;
		this.svg = svg.node()!;

		// 添加缩放事件
		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([1 / 10, 5])
			// .wheelDelta(event => {
			// 	if (event.deltaY < 0) {
			// 		if (this.zoomLevel === 5) return Math.log2(1);
			// 		this.zoomLevel = this.zoomLevel + 0.5;
			// 		return Math.log2(1 + 0.5 / (this.zoomLevel - 0.5));
			// 	} else {
			// 		if (this.zoomLevel === 0.5) return Math.log2(1);
			// 		this.zoomLevel = this.zoomLevel - 0.5;
			// 		return Math.log2(1 - 0.5 / (this.zoomLevel + 0.5));
			// 	}
			// })
			.on("zoom", e => {
				g.attr("transform", e.transform);
			});
		this.zoom = zoom;
		zoom.scaleBy(svg, this.zoomLevel);
		svg.transition().duration(1000);
		svg
			.call(zoom)
			.on("click", e => {
				const projection = this.projection;
				console.log(d3.pointer(e, g.node()));
				this.options.onClick(e, projection.invert!(d3.pointer(e, g.node())));
			})
			.on("dblclick.zoom", null);
	}
	/**
	 * 添加图层
	 * @param layer 图层实例
	 */
	addLayer(layer: Layer) {
		this.layers.push(layer);
		layer.init(this.map, this.projection);
	}
	/**
	 * 删除图层
	 * @param layer 图层实例
	 */
	removeLayer(layer: Layer) {
		for (let i = 0; i < this.layers.length; i++) {
			if (this.layers[i] === layer) {
				this.layers.splice(i, 1);
			}
		}
		layer.remove();
	}
	/**
	 * 显示指定的或所有隐藏的图层
	 * @param layer 图层
	 */
	showLayer(layer?: Layer) {
		if (layer === undefined) {
			this.layers.forEach(i => i.show());
		} else {
			layer.show();
		}
	}
	/**
	 * 隐藏指定的或所有图层
	 * @param layer 图层
	 */
	hideLayer(layer?: Layer) {
		if (layer === undefined) {
			this.layers.forEach(i => i.hide());
		} else {
			layer.show();
		}
	}

	/**
	 * 移动到指定点位
	 * @param coord 点位bd09坐标
	 * @param zoomLevel 地图缩放层级
	 */
	moveTo(coord: [number, number], zoomLevel: number = 5) {
		const svg = d3.select(this.svg);
		const realCoord = this.projection(coord)!;
		const t = d3.zoomIdentity.scale(zoomLevel).apply(realCoord);
		const m = d3.zoomIdentity
			.translate(-(t[0] - this.width / 2), -(t[1] - this.height / 2))
			.scale(zoomLevel);
		svg.transition().duration(1000).call(this.zoom.transform, m);
	}

	/**
	 * 移动到某个区域的最佳视图
	 * @param coords 坐标数组
	 * @returns
	 */
	focusOnView(coords: [number, number][]): void {
		const projectionCoords = coords.map(this.projection) as [number, number][];
		if (projectionCoords.length === 0) {
			return;
		}
		const min: number[] = [];
		const max: number[] = [];
		[min[0], max[0]] = d3.extent(projectionCoords, d => d[0]) as [
			number,
			number
		];
		[min[1], max[1]] = d3.extent(projectionCoords, d => d[1]) as [
			number,
			number
		];

		const xScale = (max[0] - min[0]) / this.width;
		const yScale = (max[1] - min[1]) / this.height;
		const middle: [number, number] = this.projection.invert!([
			(max[0] + min[0]) / 2,
			(max[1] + min[1]) / 2,
		]) as [number, number];

		const scale =
			Math.max(xScale, yScale) === 0 ? 5 : 1 / Math.max(xScale, yScale);
		if (scale < 1 / 2) {
			this.moveTo(middle, 0.5);
		} else if (scale > 5) {
			this.moveTo(middle, 5);
		} else {
			this.moveTo(middle, scale);
		}
	}
}

export default Map;
