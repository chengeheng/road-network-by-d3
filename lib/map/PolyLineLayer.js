'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../_virtual/_tslib.js');
var d3 = require('d3');
var Layer = require('./Layer.js');

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var d3__namespace = /*#__PURE__*/_interopNamespace(d3);

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
    selectColor: "yellow",
    selectable: false,
    hoverColor: "green",
    stopPropagation: false,
    onClick: function () { },
    onRightClick: function () { },
    onDbClick: function () { },
};
var PolyLineLayer = /** @class */ (function (_super) {
    _tslib.__extends(PolyLineLayer, _super);
    function PolyLineLayer(dataSource, option) {
        if (option === void 0) { option = defaultOption; }
        var _this = _super.call(this, Layer.LayerType.PolygonLayer, option) || this;
        _this.data = dataSource;
        _this.option = _tslib.__assign(_tslib.__assign({}, defaultOption), option);
        _this.clickCount = 0;
        _this.selectIndexs = new Set();
        return _this;
    }
    PolyLineLayer.prototype.init = function (svg, projection) {
        _super.prototype.init.call(this, svg, projection);
        this.path = d3__namespace.geoPath().projection(projection);
        this.container = d3__namespace.select(svg).append("g");
        this.container.selectAll("g").remove();
        this.draw();
    };
    PolyLineLayer.prototype.remove = function () {
        this.container.remove();
    };
    // TODO 显示当前图层
    PolyLineLayer.prototype.show = function () {
        this.container.style("display", "inline");
    };
    // TODO 隐藏当前图层
    PolyLineLayer.prototype.hide = function () {
        this.container.style("display", "none");
    };
    PolyLineLayer.prototype.updateData = function (data) {
        this.data = data;
        this.draw();
    };
    PolyLineLayer.prototype.draw = function () {
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
            .attr("stroke", function (d) { return d.properties.option.strokeColor; })
            .attr("stroke-width", function (d) { return d.properties.option.strokeWidth; })
            .attr("stroke-dasharray", function (d) {
            if (d.properties.option.strokeType === exports.StrokeLineType.dotted) {
                return d.properties.option.strokeDashArray;
            }
            else {
                return null;
            }
        })
            .attr("fill", "none")
            .on("click", function (e, d) {
            if (d.properties.option.stopPropagation) {
                e.stopPropagation();
            }
            _this.clickCount++;
            var originData = d.properties.originData;
            var index = d.geometry.coordinates.findIndex(function (i) {
                return _this.isPointInLine(i, d3__namespace.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
            });
            var originalParams = originData === null || originData === void 0 ? void 0 : originData.data[index];
            clearTimeout(_this.clickTimer);
            _this.clickTimer = setTimeout(function () {
                if (_this.clickCount % 2 === 1) {
                    _this.clickCount--;
                    var clickFn = d.properties.option.onClick;
                    var selectable = d.properties.option.selectable;
                    if (selectable) {
                        if (_this.selectIndexs.has(index)) {
                            _this.selectIndexs.delete(index);
                        }
                        else {
                            _this.selectIndexs.add(index);
                        }
                        _this.selectLayer.select("path").remove();
                        var selectedDatas = d.properties.originData.data.filter(function (_, index) {
                            return _this.selectIndexs.has(index);
                        });
                        var selectedPaths = selectedDatas.reduce(function (pre, cur) {
                            pre.push(cur.coordinates);
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
                }
                else {
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
                var index = coordinates.findIndex(function (i) {
                    return _this.isPointInLine(i, d3__namespace.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
                });
                if (index > -1) {
                    _this.hoverLayer.select("path").remove();
                    var selectedData = d.properties.originData.data[index];
                    var selectedPaths = [];
                    selectedPaths.push(selectedData.coordinates);
                    _this.drawHoverLayer(selectedPaths, d.properties);
                }
            }
        })
            .on("mouseleave", function () {
            _this.hoverLayer.select("path").remove();
        })
            .on("contextmenu", function (e, d) {
            var _a;
            var index = d.geometry.coordinates.findIndex(function (i) {
                return _this.isPointInLine(i, d3__namespace.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
            });
            var originalParams = (_a = d.properties.originData) === null || _a === void 0 ? void 0 : _a.data[index];
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
    PolyLineLayer.prototype.drawSelectLayer = function (coords, properties) {
        this.selectLayer
            .selectAll("path")
            .data([
            {
                type: "Feature",
                geometry: {
                    type: "MultiLineString",
                    coordinates: coords,
                },
                properties: properties,
            },
        ])
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (l) { return l.properties.option.selectColor; })
            .attr("stroke-width", function (l) { return l.properties.option.strokeWidth; })
            .attr("fill", "none")
            .attr("stroke-dasharray", function (l) {
            if (l.properties.option.strokeType === exports.StrokeLineType.dotted) {
                return l.properties.option.strokeDashArray;
            }
            else {
                return null;
            }
        });
    };
    PolyLineLayer.prototype.drawHoverLayer = function (coords, properties) {
        var _a;
        this.hoverLayer
            .selectAll("path")
            .data([
            {
                type: "Feature",
                geometry: {
                    type: "MultiLineString",
                    coordinates: (_a = _tslib.__spreadArray([], coords, true)) !== null && _a !== void 0 ? _a : [],
                },
                properties: properties,
            },
        ])
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (d) { return d.properties.option.hoverColor; })
            .attr("stroke-width", function (d) { return d.properties.option.strokeWidth; })
            .attr("fill", "none")
            .attr("stroke-dasharray", function (l) {
            if (l.properties.option.strokeType === exports.StrokeLineType.dotted) {
                return l.properties.option.strokeDashArray;
            }
            else {
                return null;
            }
        });
    };
    PolyLineLayer.prototype.formatData = function (data) {
        var _this = this;
        return data.reduce(function (pre, cur) {
            var _a = cur.data, data = _a === void 0 ? [] : _a, _b = cur.option, option = _b === void 0 ? {} : _b;
            var ids = [];
            var coordinates = [];
            data.forEach(function (j) {
                ids.push(j.id);
                coordinates.push(j.coordinates);
            });
            pre.push({
                type: "Feature",
                geometry: {
                    type: "MultiLineString",
                    coordinates: coordinates,
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
    PolyLineLayer.prototype.isPointInLine = function (coordinates, point, projection, lineWidth) {
        var halfWidth = lineWidth / 2;
        var lineAreas = coordinates.map(projection).reduce(function (pre, cur) {
            pre.unshift([cur[0] + halfWidth, cur[1] + halfWidth]);
            pre.push([cur[0] - halfWidth, cur[1] - halfWidth]);
            return pre;
        }, []);
        return d3__namespace.polygonContains(lineAreas, point);
    };
    return PolyLineLayer;
}(Layer["default"]));

exports["default"] = PolyLineLayer;
