"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var _tslib = require("../_virtual/_tslib.js");
var d3 = require("d3");

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== "default") {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(
					n,
					k,
					d.get
						? d
						: {
								enumerable: true,
								get: function () {
									return e[k];
								},
						  }
				);
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var d3__namespace = /*#__PURE__*/ _interopNamespace(d3);

var defaultOptions = {
	center: [118.39067530252157, 31.343146080447582],
	onClick: function () {},
};
var Map = /** @class */ (function () {
	function Map(id, options) {
		if (options === void 0) {
			options = defaultOptions;
		}
		var _this = this;
		// 初始化值
		this.id = id;
		this.width = 0;
		this.height = 0;
		this.layers = [];
		this.projection = d3__namespace.geoMercator();
		var container = document.getElementById(this.id);
		if (container === null) {
			throw Error("地图容器的id不能为空");
		} else {
			this.container = container;
			var option = _tslib.__assign(_tslib.__assign({}, defaultOptions), options);
			this.options = option;
			var rect = container.getBoundingClientRect();
			this.width = rect.width;
			this.height = rect.height;
			this.projection = d3__namespace
				.geoMercator()
				.scale(20000000)
				.center(option.center)
				.translate([rect.width / 2, rect.height / 2]);
			this.init();
			var resizeObserver = new ResizeObserver(function (e) {
				var rect = container.getBoundingClientRect();
				_this.width = rect.width;
				_this.height = rect.height;
				d3__namespace.select(_this.svg).attr("width", rect.width).attr("height", rect.height);
			});
			resizeObserver.observe(container);
		}
	}
	//  初始化地图
	Map.prototype.init = function () {
		var _this = this;
		var container = d3__namespace.select(this.container);
		container.select("svg").remove();
		var svg = container
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.style("cursor", "pointer");
		if (this.options.class) {
			svg.attr("class", this.options.class);
		}
		var g = svg.append("g");
		this.map = g.node();
		this.svg = svg.node();
		// 添加缩放事件
		var zoom = d3__namespace
			.zoom()
			.scaleExtent([1 / 5, 5])
			.on("zoom", function (e) {
				g.attr("transform", e.transform);
			});
		zoom.scaleBy(svg, 1);
		svg
			.call(zoom)
			.on("click", function (e) {
				var projection = _this.projection;
				_this.options.onClick(e, projection.invert(d3__namespace.pointer(e, g.node())));
			})
			.on("dblclick.zoom", null);
	};
	Map.prototype.addLayer = function (layer) {
		this.layers.push(layer);
		layer.init(this.map, this.projection);
	};
	Map.prototype.removeLayer = function (layer) {
		for (var i = 0; i < this.layers.length; i++) {
			if (this.layers[i] === layer) {
				this.layers.splice(i, 1);
			}
		}
		layer.remove();
	};
	// TODO 显示隐藏的layer
	Map.prototype.showLayer = function () {};
	// TODO 隐藏layer
	Map.prototype.hideLayer = function () {};
	return Map;
})();

exports["default"] = Map;
