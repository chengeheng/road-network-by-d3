import * as d3 from "d3";

import { zooms } from "./constants/config";
import Layer from "./Layers";

interface MapOption {
	center?: [number, number];
	class?: string;
	onClick?: Function;
	[propName: string]: any;
}

const defaultOptions = {
	center: [118.39067530252157, 31.343146080447582] as [number, number],
	onClick: () => {},
};

class Map {
	private id: string;
	private container: HTMLElement;
	private map!: SVGGElement;
	private width: number;
	private height: number;
	private svg!: SVGSVGElement;
	private options: MapOption;
	private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;

	private layers: Layer[];

	private _level: number;

	projection: d3.GeoProjection;

	constructor(id: string, options: MapOption = defaultOptions) {
		// 初始化值
		this.id = id;
		this.width = 0;
		this.height = 0;
		this.layers = [];
		this._level = 2;
		// this.zoomLevel = 1;

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
				.scale(36292043.780950055)
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
			.scaleExtent([zooms[19], zooms[0]])
			.wheelDelta(event => {
				if (event.deltaY < 0) {
					if (this._level === 1) return Math.log2(1);
					this._level--;
					return Math.log2(zooms[this._level - 1] / zooms[this._level]);
				} else {
					if (this._level === 20) return Math.log2(1);
					this._level++;
					return Math.log2(zooms[this._level - 1] / zooms[this._level - 2]);
				}
			})
			.on("zoom", e => {
				g.attr("transform", e.transform);
			});
		this.zoom = zoom;
		zoom.scaleBy(svg, zooms[this._level - 1]);
		svg.transition().duration(1000);
		zoom.duration(1000);
		svg
			.call(zoom)
			.on("click", e => {
				const projection = this.projection;
				// console.log(d3.pointer(e, g.node()));
				if (this.options.onClick) {
					this.options.onClick(e, projection.invert!(d3.pointer(e, g.node())));
				}
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
	 * @param zoomLevel 地图缩放层级[1-20]
	 */
	moveTo(coord: [number, number], zoomLevel: number = 2) {
		if (zoomLevel < 1) {
			this._level = 1;
		} else if (zoomLevel > 20) {
			this._level = 20;
		} else {
			this._level = Math.floor(zoomLevel);
		}
		const svg = d3.select(this.svg);
		const realCoord = this.projection(coord)!;
		const t = d3.zoomIdentity.scale(zooms[zoomLevel - 1]).apply(realCoord);
		const m = d3.zoomIdentity
			.translate(-(t[0] - this.width / 2), -(t[1] - this.height / 2))
			.scale(zooms[zoomLevel - 1]);
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

		const diffs = zooms.map(i => Math.abs(scale - i));
		const minDiff = Math.min(...diffs);
		const index = diffs.indexOf(minDiff);

		if (index < 19) {
			this.moveTo(middle, index + 2);
		} else {
			this.moveTo(middle, index + 1);
		}
	}
	/**
	 * 设定地图缩放等级
	 * @param {number} level 地图缩放等级
	 */
	setLevel(level: number) {
		const curLevel = this._level;
		if (level >= 20) {
			this._level = 20;
		} else if (level <= 1) {
			this._level = 1;
		} else {
			this._level = Math.floor(level);
		}
		this.zoom.scaleBy(
			d3.select(this.svg).transition().duration(500),
			zooms[this._level - 1] / zooms[curLevel - 1]
		);
	}
}

export default Map;
