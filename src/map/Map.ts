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

	private layers: Layer[];

	projection: d3.GeoProjection;

	constructor(id: string, options: MapOption = defaultOptions) {
		// 初始化值
		this.id = id;
		this.width = 0;
		this.height = 0;
		this.layers = [];

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
				.scale(20000000)
				.center(option.center!)
				.translate([rect.width / 2, rect.height / 2]);

			this.init();
			const resizeObserver = new ResizeObserver(e => {
				const rect = container.getBoundingClientRect();
				this.width = rect.width;
				this.height = rect.height;
				d3.select(this.svg).attr("width", rect.width).attr("height", rect.height);
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
			.scaleExtent([1 / 5, 5])
			.on("zoom", e => {
				g.attr("transform", e.transform);
			});
		zoom.scaleBy(svg, 1);
		svg
			.call(zoom)
			.on("click", e => {
				const projection = this.projection;
				this.options.onClick(e, projection.invert!(d3.pointer(e, g.node())));
			})
			.on("dblclick.zoom", null);
	}

	addLayer(layer: Layer) {
		this.layers.push(layer);
		layer.init(this.map, this.projection);
	}

	removeLayer(layer: Layer) {
		for (let i = 0; i < this.layers.length; i++) {
			if (this.layers[i] === layer) {
				this.layers.splice(i, 1);
			}
		}
		layer.remove();
	}
	// TODO 显示隐藏的layer
	showLayer() {}
	// TODO 隐藏layer
	hideLayer() {}
}

export default Map;
