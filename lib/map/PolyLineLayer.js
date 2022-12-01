var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import * as d3 from "d3";
import Layer, { LayerType } from "./Layer";
var StrokeLineType;
(function (StrokeLineType) {
    StrokeLineType["dotted"] = "dotted";
    StrokeLineType["solid"] = "solid";
})(StrokeLineType || (StrokeLineType = {}));
var defaultOption = {
    strokeColor: "#333333",
    strokeWidth: 1,
    strokeOpacity: 1,
    strokeType: StrokeLineType.solid,
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
    __extends(PolyLineLayer, _super);
    function PolyLineLayer(dataSource, option) {
        if (option === void 0) { option = defaultOption; }
        var _this = _super.call(this, LayerType.PolygonLayer, option) || this;
        _this.data = dataSource;
        _this.option = __assign(__assign({}, defaultOption), option);
        _this.clickCount = 0;
        _this.selectIndexs = new Set();
        return _this;
    }
    PolyLineLayer.prototype.init = function (svg, projection) {
        _super.prototype.init.call(this, svg, projection);
        this.path = d3.geoPath().projection(projection);
        this.container = d3.select(svg).append("g");
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
            if (d.properties.option.strokeType === StrokeLineType.dotted) {
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
                return _this.isPointInLine(i, d3.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
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
                    return _this.isPointInLine(i, d3.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
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
                return _this.isPointInLine(i, d3.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
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
            if (l.properties.option.strokeType === StrokeLineType.dotted) {
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
                    coordinates: (_a = __spreadArray([], coords, true)) !== null && _a !== void 0 ? _a : [],
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
            if (l.properties.option.strokeType === StrokeLineType.dotted) {
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
                    option: __assign(__assign({}, _this.option), option),
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
        return d3.polygonContains(lineAreas, point);
    };
    return PolyLineLayer;
}(Layer));
export { PolyLineLayer as default, StrokeLineType };
