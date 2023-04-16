import * as d3 from "d3";

interface EditPolygonProps {
	map: SVGGElement;
	container: d3.Selection<any, unknown, null, undefined>;
	projection: d3.GeoProjection;
}

class EditPolygon {
	private _map!: SVGGElement;
	private _data: [number, number][];
	private _parent: d3.Selection<any, unknown, null, undefined>;
	private _path!: d3.GeoPath<any, any>;
	private _projection!: d3.GeoProjection;

	constructor(options: EditPolygonProps) {
		this._data = [];
		this._map = options.map;
		this._projection = options.projection;
		this._parent = options.container;
		this._path = d3.geoPath<any, any>().projection(this._projection);
	}

	addData(data: [number, number]) {
		const len = this._data.length;
		if (len === 0) {
			this._data.push(data, data);
		} else {
			this._data.splice(len - 1, 0, data);
		}
		this._draw();
	}

	printCoordinates() {
		return this._data;
	}

	private _drawPolygon() {
		const update = this._parent?.selectAll("path").data([
			{
				type: "Feature",
				geometry: {
					type: "Polygon",
					coordinates: [this._data],
				},
				properties: {
					id: "polygon",
				},
			},
		]);

		update.attr("d", d => {
			return this._path(d);
		});

		update
			.enter()
			.append("path")
			.attr("d", d => {
				return this._path(d);
			})
			.attr("stroke", "#87ceeb")
			.attr("stroke-width", 4)
			.attr("fill", "#87ceeb")
			.attr("fill-opacity", 0.5)
			.exit()
			.remove();
	}

	private _drawPoints() {
		const me = this;
		const pointData = this._data.slice(0, this._data.length - 1).map((i, idx) => {
			const [x, y] = this._projection(i)!;
			return {
				x: x,
				y: y,
				idx,
			};
		});
		const draged = d3
			.drag<SVGCircleElement, { x: number; y: number; idx: number }>()
			.on("start", e => {
				e.sourceEvent.stopPropagation();
			})
			.on("drag", function (e, d, ...c) {
				const { idx } = d;
				const len = me._data.length;
				if (idx === 0) {
					me._data[len - 1] = me._projection.invert!(d3.pointer(e, me._map))!;
				}
				me._data[idx] = me._projection.invert!(d3.pointer(e, me._map))!;
				d3.select(this)
					.raise()
					.attr("cx", (d.x = e.x))
					.attr("cy", (d.y = e.y));
				me._drawPolygon();
			})
			.on("end", () => {});
		const update = this._parent?.selectAll("circle").data(pointData);
		update
			.enter()
			.append<SVGCircleElement>("circle")
			.attr("cx", d => d.x)
			.attr("cy", d => d.y)
			.attr("r", 10)
			.attr("stroke", "#666")
			.attr("stroke-width", 1)
			.attr("fill", "transparent")
			.call(draged)
			.exit()
			.remove();
	}

	private _draw() {
		this._confirmError();
		this._drawPolygon();
		this._drawPoints();
	}

	private _confirmError() {
		if (this._parent === null) {
			throw new Error("线图元必须绘制在容器中");
		}
	}
}

export type { EditPolygonProps };
export { EditPolygon as default };
