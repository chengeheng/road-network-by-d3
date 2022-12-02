"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var _tslib = require("../_virtual/_tslib.js");
var d3 = require("d3");
var Layer = require("./Layer.js");

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

exports.StrokeLineType = void 0;
(function (StrokeLineType) {
	StrokeLineType["dotted"] = "dotted";
	StrokeLineType["solid"] = "solid";
})(exports.StrokeLineType || (exports.StrokeLineType = {}));
var defaultOption = {
	strokeColor: "#333333",
	strokeWidth: 1,
	strokeOpacity: 1,
	strokeType: exports.StrokeLineType.solid,
	strokeDashArray: [2, 3],
	fillColor: "transparent",
	fillOpacity: 1,
	selectColor: "yellow",
	selectable: false,
	hoverColor: "green",
	stopPropagation: false,
	onClick: function () {},
	onRightClick: function () {},
	onDbClick: function () {},
};
var PolygonLayer = /** @class */ (function (_super) {
	_tslib.__extends(PolygonLayer, _super);
	function PolygonLayer(dataSource, option) {
		if (option === void 0) {
			option = defaultOption;
		}
		var _this = _super.call(this, Layer.LayerType.PolygonLayer, option) || this;
		_this.data = dataSource;
		_this.option = _tslib.__assign(_tslib.__assign({}, defaultOption), option);
		_this.clickCount = 0;
		_this.selectIndexs = new Set();
		return _this;
	}
	PolygonLayer.prototype.init = function (svg, projection) {
		_super.prototype.init.call(this, svg, projection);
		this.path = d3__namespace.geoPath().projection(projection);
		this.container = d3__namespace.select(svg).append("g");
		this.container.selectAll("g").remove();
		this.draw();
	};
	PolygonLayer.prototype.remove = function () {
		this.container.remove();
	};
	// TODO 显示当前图层
	PolygonLayer.prototype.show = function () {
		this.container.style("display", "inline");
	};
	// TODO 隐藏当前图层
	PolygonLayer.prototype.hide = function () {
		this.container.style("display", "none");
	};
	PolygonLayer.prototype.updateData = function (data) {
		this.data = data;
		this.draw();
	};
	PolygonLayer.prototype.draw = function () {
		var _this = this;
		var base = this.container;
		this.baseLayer = base.append("g");
		this.selectLayer = base.append("g").style("pointer-events", "none");
		this.hoverLayer = base.append("g").style("pointer-events", "none");
		this.baseLayer
			.selectAll("path")
			.data(this.formatData(this.data))
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", function (d) {
				return d.properties.option.strokeColor;
			})
			.attr("stroke-width", function (d) {
				return d.properties.option.strokeWidth;
			})
			.attr("stroke-dasharray", function (d) {
				if (d.properties.option.strokeType === exports.StrokeLineType.dotted) {
					return d.properties.option.strokeDashArray;
				} else {
					return null;
				}
			})
			.attr("stroke-opacity", function (d) {
				return d.properties.option.strokeOpacity;
			})
			.attr("fill", function (d) {
				return d.properties.option.fillColor;
			})
			.attr("fill-opacity", function (d) {
				return d.properties.option.fillOpacity;
			})
			.on("click", function (e, d) {
				if (d.properties.option.stopPropagation) {
					e.stopPropagation();
				}
				_this.clickCount++;
				var coordinates = d.geometry.coordinates;
				var originData = d.properties.originData;
				var targetCoord = _this.projection.invert(d3__namespace.pointer(e, _this.container.node()));
				var index = coordinates.findIndex(function (i) {
					return d3__namespace.polygonContains(i, targetCoord);
				});
				var originalParams =
					originData === null || originData === void 0 ? void 0 : originData.data[index];
				clearTimeout(_this.clickTimer);
				_this.clickTimer = setTimeout(function () {
					if (_this.clickCount % 2 === 1) {
						_this.clickCount--;
						var clickFn = d.properties.option.onClick;
						var selectable = d.properties.option.selectable;
						if (selectable) {
							if (_this.selectIndexs.has(index)) {
								_this.selectIndexs.delete(index);
							} else {
								_this.selectIndexs.add(index);
							}
							_this.selectLayer.select("path").remove();
							var selectedDatas = d.properties.originData.data.filter(function (_, index) {
								return _this.selectIndexs.has(index);
							});
							var selectedPaths = selectedDatas.reduce(function (pre, cur) {
								pre.push(cur.coordinates);
								if (cur.reverseCoords) {
									pre.push(cur.reverseCoords);
								}
								return pre;
							}, []);
							_this.drawSelectLayer(selectedPaths, d.properties);
						}
						if (clickFn) {
							clickFn({
								data: originalParams,
								PointerEvent: e,
								target: {
									index: index,
									data: originalParams,
									selected: _this.selectIndexs.has(index),
								},
								originData: originData,
							});
						}
					} else {
						_this.clickCount = 0;
						var dblClickFn = d.properties.option.onDbClick;
						if (dblClickFn) {
							dblClickFn({
								data: originalParams,
								PointerEvent: e,
								target: {
									index: index,
									data: originalParams,
									selected: _this.selectIndexs.has(index),
								},
								originData: originData,
							});
						}
					}
				}, 300);
			})
			.on("mousemove", function (e, d) {
				var coordinates = d.geometry.coordinates;
				var hasHover = d.properties.option.hoverColor;
				if (hasHover) {
					var targetCoord_1 = _this.projection.invert(
						d3__namespace.pointer(e, _this.container.node())
					);
					var index = coordinates.findIndex(function (i) {
						return d3__namespace.polygonContains(i, targetCoord_1);
					});
					if (index > -1) {
						_this.hoverLayer.select("path").remove();
						var selectedData = d.properties.originData.data[index];
						var selectedPaths = [];
						selectedPaths.push(selectedData.coordinates);
						if (selectedData.reverseCoords) {
							selectedPaths.push(selectedData.reverseCoords);
						}
						_this.drawHoverLayer(selectedPaths, d.properties);
					}
				}
			})
			.on("mouseleave", function () {
				_this.hoverLayer.select("path").remove();
			})
			.on("contextmenu", function (e, d) {
				var _a;
				var targetCoord = _this.projection.invert(d3__namespace.pointer(e, _this.container.node()));
				var index = d.geometry.coordinates.findIndex(function (i) {
					return d3__namespace.polygonContains(i, targetCoord);
				});
				var originalParams =
					(_a = d.properties.originData) === null || _a === void 0 ? void 0 : _a.data[index];
				var rightClickFn = d.properties.option.onRightClick;
				if (rightClickFn) {
					rightClickFn({
						data: originalParams,
						PointerEvent: e,
						target: {
							index: index,
							data: originalParams,
							selected: _this.selectIndexs.has(index),
						},
						originData: d.properties.originData,
					});
				}
			});
	};
	PolygonLayer.prototype.drawSelectLayer = function (coords, properties) {
		this.selectLayer
			.selectAll("path")
			.data([
				{
					type: "Feature",
					geometry: {
						type: "Polygon",
						coordinates: coords,
					},
					properties: properties,
				},
			])
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", function (l) {
				return l.properties.option.strokeColor;
			})
			.attr("stroke-width", function (l) {
				return l.properties.option.strokeWidth;
			})
			.attr("stroke-opacity", function (d) {
				return d.properties.option.strokeOpacity;
			})
			.attr("fill", function (l) {
				return l.properties.option.selectColor;
			})
			.attr("stroke-dasharray", function (l) {
				if (l.properties.option.strokeType === exports.StrokeLineType.dotted) {
					return l.properties.option.strokeDashArray;
				} else {
					return null;
				}
			});
	};
	PolygonLayer.prototype.drawHoverLayer = function (coords, properties) {
		var _a;
		this.hoverLayer
			.selectAll("path")
			.data([
				{
					type: "Feature",
					geometry: {
						type: "Polygon",
						coordinates:
							(_a = _tslib.__spreadArray([], coords, true)) !== null && _a !== void 0 ? _a : [],
					},
					properties: properties,
				},
			])
			.enter()
			.append("path")
			.attr("d", this.path)
			.attr("stroke", function (d) {
				return d.properties.option.strokeColor;
			})
			.attr("stroke-width", function (d) {
				return d.properties.option.strokeWidth;
			})
			.attr("stroke-opacity", function (d) {
				return d.properties.option.strokeOpacity;
			})
			.attr("fill", function (d) {
				return d.properties.option.hoverColor;
			})
			.attr("fill-opacity", function (d) {
				return d.properties.option.fillOpacity;
			})
			.attr("stroke-dasharray", function (l) {
				if (l.properties.option.strokeType === exports.StrokeLineType.dotted) {
					return l.properties.option.strokeDashArray;
				} else {
					return null;
				}
			});
	};
	PolygonLayer.prototype.formatData = function (data) {
		var _this = this;
		return data.reduce(function (pre, cur) {
			var _a = cur.data,
				data = _a === void 0 ? [] : _a,
				_b = cur.option,
				option = _b === void 0 ? {} : _b;
			var ids = [];
			var coordinates = [];
			var reverseCoords = [];
			data.forEach(function (j) {
				ids.push(j.id);
				coordinates.push(j.coordinates);
				if (j.reverseCoords) {
					reverseCoords.push(j.reverseCoords);
				}
			});
			pre.push({
				type: "Feature",
				geometry: {
					type: "Polygon",
					coordinates: _tslib.__spreadArray(
						_tslib.__spreadArray([], coordinates, true),
						reverseCoords,
						true
					),
				},
				properties: {
					option: _tslib.__assign(_tslib.__assign({}, _this.option), option),
					ids: ids,
					originData: cur,
				},
			});
			return pre;
		}, []);
	};
	return PolygonLayer;
})(Layer["default"]);

exports["default"] = PolygonLayer;
