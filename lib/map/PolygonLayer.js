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
    fillColor: "transparent",
    fillOpacity: 1,
    selectColor: "yellow",
    selectable: false,
    hoverColor: "green",
    stopPropagation: false,
    onClick: function () { },
    onRightClick: function () { },
    onDbClick: function () { },
    selectType: "link",
};
var defaultNameStyle = {
    fontSize: 14,
    fontWeight: 400,
    color: "#333333",
    rotate: 0,
};
var PolygonLayer = /** @class */ (function (_super) {
    _tslib.__extends(PolygonLayer, _super);
    function PolygonLayer(dataSource, option) {
        if (option === void 0) { option = defaultOption; }
        var _this = _super.call(this, Layer.LayerType.PolygonLayer, option) || this;
        _this.data = dataSource;
        _this.option = _tslib.__assign(_tslib.__assign({}, defaultOption), option);
        _this.clickCount = 0;
        _this.selectIndex = new Map();
        _this.isHided = false;
        _this.length = dataSource.length;
        _this._selectType = _this.option.selectType;
        _this._allIndex = new Map();
        _this._hoverIndex = new Map();
        return _this;
    }
    PolygonLayer.prototype.init = function (g, projection) {
        _super.prototype.init.call(this, g, projection);
        this.path = d3__namespace.geoPath().projection(projection);
        this.container = d3__namespace
            .select(g)
            .append("g")
            .attr("id", "polygon-layer-".concat(this.makeRandomId()));
        this.container.selectAll("g").remove();
        this.baseLayer = this.container.append("g");
        this.selectLayer = this.container
            .append("g")
            .style("pointer-events", "none");
        this.hoverLayer = this.container
            .append("g")
            .style("pointer-events", "none");
        this.draw();
    };
    PolygonLayer.prototype.remove = function () {
        this.container.remove();
    };
    /**
     * 显示当前图层
     */
    PolygonLayer.prototype.show = function () {
        this.container.style("display", "inline");
    };
    /**
     * 隐藏当前图层
     */
    PolygonLayer.prototype.hide = function () {
        this.container.style("display", "none");
    };
    PolygonLayer.prototype.enableLayerFunc = function () {
        this.container.style("pointer-events", "inherit");
    };
    PolygonLayer.prototype.disableLayerFunc = function () {
        this.container.style("pointer-events", "none");
    };
    PolygonLayer.prototype.updateData = function (data) {
        this.data = data;
        this.baseLayer.selectAll("path").remove();
        this.selectLayer.selectAll("*").remove();
        this.hoverLayer.selectAll("*").remove();
        this.selectIndex = new Map();
        this.draw();
    };
    PolygonLayer.prototype.setSelectType = function (type) {
        this._selectType = type;
    };
    PolygonLayer.prototype.draw = function () {
        var _this = this;
        var _a = this.formatData(this.data, function (e, outerIndex, innerIndex) {
            var _a;
            if (_this._allIndex.has(outerIndex)) {
                (_a = _this._allIndex.get(outerIndex)) === null || _a === void 0 ? void 0 : _a.add(innerIndex);
            }
            else {
                _this._allIndex.set(outerIndex, new Set([innerIndex]));
            }
            return true;
        }), pathData = _a[0], nameData = _a[1];
        var pathGroup = this.baseLayer.append("g");
        var nameGroup = this.baseLayer
            .append("g")
            .style("pointer-events", "none");
        pathGroup
            .selectAll("path")
            .data(pathData)
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
            .attr("stroke-opacity", function (d) { return d.properties.option.strokeOpacity; })
            .attr("fill", function (d) { return d.properties.option.fillColor; })
            .attr("fill-opacity", function (d) { return d.properties.option.fillOpacity; })
            .on("click", function (e, d) {
            if (d.properties.option.stopPropagation) {
                e.stopPropagation();
            }
            _this.clickCount++;
            var coordinates = d.geometry.coordinates;
            var originData = d.properties.originData;
            var targetCoord = _this.projection.invert(d3__namespace.pointer(e, _this.map));
            var index = coordinates.findIndex(function (i) {
                return d3__namespace.polygonContains(i, targetCoord);
            });
            var originalParams;
            if (_this._selectType === "all") {
                originalParams = _this.data;
            }
            else if (_this._selectType === "path") {
                originalParams = d.properties.originData;
            }
            else {
                originalParams = originData === null || originData === void 0 ? void 0 : originData.data[index];
            }
            clearTimeout(_this.clickTimer);
            _this.clickTimer = setTimeout(function () {
                if (_this.clickCount % 2 === 1) {
                    _this.clickCount--;
                    var clickFn = d.properties.option.onClick;
                    var selectable = d.properties.option.selectable;
                    if (selectable) {
                        _this.selectIndex = _this.combineIndex(_this.selectIndex, d.properties.index, index);
                        _this.drawSelectLayer();
                    }
                    if (clickFn) {
                        clickFn({
                            data: originalParams,
                            PointerEvent: e,
                            target: {
                                index: index,
                                data: originalParams,
                                selected: _this.selectIndex.get(d.properties.index)
                                    ? _this.selectIndex.get(d.properties.index).has(index)
                                    : false,
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
                                selected: _this.selectIndex.get(d.properties.index)
                                    ? _this.selectIndex.get(d.properties.index).has(index)
                                    : false,
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
                var targetCoord_1 = _this.projection.invert(d3__namespace.pointer(e, _this.container.node()));
                var index = coordinates.findIndex(function (i) {
                    return d3__namespace.polygonContains(i, targetCoord_1);
                });
                _this._hoverIndex = _this.combineIndex(new Map(), d.properties.index, index);
                if (index > -1) {
                    _this.drawHoverLayer();
                }
            }
        })
            .on("mouseleave", function () {
            _this.hoverLayer.selectAll("*").remove();
        })
            .on("contextmenu", function (e, d) {
            var _a;
            var targetCoord = _this.projection.invert(d3__namespace.pointer(e, _this.container.node()));
            var index = d.geometry.coordinates.findIndex(function (i) {
                return d3__namespace.polygonContains(i, targetCoord);
            });
            var originalParams;
            if (_this._selectType === "all") {
                originalParams = _this.data;
            }
            else if (_this._selectType === "path") {
                originalParams = d.properties.originData;
            }
            else {
                originalParams = (_a = d.properties.originData) === null || _a === void 0 ? void 0 : _a.data[index];
            }
            var rightClickFn = d.properties.option.onRightClick;
            if (rightClickFn) {
                rightClickFn({
                    data: originalParams,
                    PointerEvent: e,
                    target: {
                        index: index,
                        data: originalParams,
                        selected: _this.selectIndex.get(d.properties.index)
                            ? _this.selectIndex.get(d.properties.index).has(index)
                            : false,
                    },
                    originData: d.properties.originData,
                });
            }
        });
        nameGroup
            .selectAll("text")
            .data(nameData)
            .enter()
            .append("text")
            .attr("x", function (d) { return d.coordinate[0]; })
            .attr("y", function (d) { return d.coordinate[1]; })
            .attr("font-size", function (d) { return d.fontSize; })
            .attr("fill", function (d) { return d.color; })
            .style("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("transform", function (d) { return "rotate(".concat(d.rotate, ", ").concat(d.coordinate[0], ", ").concat(d.coordinate[1], ")"); })
            .attr("font-weight", function (d) { return d.fontWeight; })
            .text(function (d) { return d.name; });
    };
    PolygonLayer.prototype.combineIndex = function (idxs, index, // 外部index
    idx // 内部index
    ) {
        var _a, _b;
        switch (this._selectType) {
            case "all": {
                if (idxs.size === this.length) {
                    idxs = new Map();
                }
                else {
                    idxs = this._allIndex;
                }
                return idxs;
            }
            case "path": {
                if (idxs.has(index)) {
                    idxs.delete(index);
                }
                else {
                    idxs.set(index, new Set(this._allIndex.get(index)));
                }
                return idxs;
            }
            case "link": {
                if (idxs.has(index)) {
                    var temp = idxs.get(index);
                    if (temp.has(idx)) {
                        temp.delete(idx);
                        if (temp.size <= 0) {
                            idxs.delete(index);
                        }
                    }
                    else {
                        (_a = idxs.get(index)) === null || _a === void 0 ? void 0 : _a.add(idx);
                    }
                }
                else {
                    idxs.set(index, new Set([idx]));
                }
                return idxs;
            }
            default: {
                if (idxs.has(index)) {
                    var temp = idxs.get(index);
                    if (temp.has(idx)) {
                        temp.delete(idx);
                        if (temp.size <= 0) {
                            idxs.delete(index);
                        }
                    }
                    else {
                        (_b = idxs.get(index)) === null || _b === void 0 ? void 0 : _b.add(idx);
                    }
                }
                else {
                    idxs.set(index, new Set([idx]));
                }
                return idxs;
            }
        }
    };
    PolygonLayer.prototype.drawSelectLayer = function () {
        var _this = this;
        this.selectLayer.selectAll("*").remove();
        var pathGroup = this.selectLayer.append("g");
        var nameGroup = this.selectLayer.append("g");
        var _a = this.formatData(this.data, function (e, idx, index) {
            if (!_this.selectIndex.get(idx)) {
                return false;
            }
            else {
                return _this.selectIndex.get(idx).has(index);
            }
        }), pathData = _a[0], nameData = _a[1];
        pathGroup
            .selectAll("path")
            .data(pathData)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (l) { return l.properties.option.strokeColor; })
            .attr("stroke-width", function (l) { return l.properties.option.strokeWidth; })
            .attr("stroke-opacity", function (d) { return d.properties.option.strokeOpacity; })
            .attr("fill", function (l) { return l.properties.option.selectColor; })
            .attr("stroke-dasharray", function (l) {
            if (l.properties.option.strokeType === exports.StrokeLineType.dotted) {
                return l.properties.option.strokeDashArray;
            }
            else {
                return null;
            }
        });
        nameGroup
            .selectAll("text")
            .data(nameData)
            .enter()
            .append("text")
            .attr("x", function (d) { return d.coordinate[0]; })
            .attr("y", function (d) { return d.coordinate[1]; })
            .attr("font-size", function (d) { return d.fontSize; })
            .attr("fill", function (d) { return d.color; })
            .attr("font-weight", function (d) { return d.fontWeight; })
            .style("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("transform", function (d) { return "rotate(".concat(d.rotate, ", ").concat(d.coordinate[0], ", ").concat(d.coordinate[1], ")"); })
            .text(function (d) { return d.name; });
    };
    PolygonLayer.prototype.drawHoverLayer = function () {
        var _this = this;
        this.hoverLayer.selectAll("*").remove();
        var pathGroup = this.hoverLayer.append("g");
        var nameGroup = this.hoverLayer.append("g");
        var _a = this.formatData(this.data, function (e, idx, index) {
            if (!_this._hoverIndex.get(idx)) {
                return false;
            }
            else {
                return _this._hoverIndex.get(idx).has(index);
            }
        }), pathData = _a[0], nameData = _a[1];
        pathGroup
            .selectAll("path")
            .data(pathData)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (d) { return d.properties.option.strokeColor; })
            .attr("stroke-width", function (d) { return d.properties.option.strokeWidth; })
            .attr("stroke-opacity", function (d) { return d.properties.option.strokeOpacity; })
            .attr("fill", function (d) { return d.properties.option.hoverColor; })
            .attr("fill-opacity", function (d) { return d.properties.option.fillOpacity; })
            .attr("stroke-dasharray", function (l) {
            if (l.properties.option.strokeType === exports.StrokeLineType.dotted) {
                return l.properties.option.strokeDashArray;
            }
            else {
                return null;
            }
        });
        nameGroup
            .selectAll("text")
            .data(nameData)
            .enter()
            .append("text")
            .attr("x", function (d) { return d.coordinate[0]; })
            .attr("y", function (d) { return d.coordinate[1]; })
            .attr("font-size", function (d) { return d.fontSize; })
            .attr("fill", function (d) { return d.color; })
            .attr("font-weight", function (d) { return d.fontWeight; })
            .style("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("transform", function (d) { return "rotate(".concat(d.rotate, ", ").concat(d.coordinate[0], ", ").concat(d.coordinate[1], ")"); })
            .text(function (d) { return d.name; });
    };
    PolygonLayer.prototype.formatData = function (data, dataFilter) {
        var _this = this;
        var nameData = [];
        var pathData = data.reduce(function (pre, cur, idx) {
            var _a = cur.data, data = _a === void 0 ? [] : _a, _b = cur.option, option = _b === void 0 ? {} : _b;
            var ids = [];
            var coordinates = [];
            var reverseCoords = [];
            data.forEach(function (j, innerIndex) {
                if (dataFilter) {
                    if (!dataFilter(j, idx, innerIndex)) {
                        return;
                    }
                }
                ids.push(j.id);
                coordinates.push(j.coordinates);
                if (j.name) {
                    var nameStyle = _tslib.__assign(_tslib.__assign({}, defaultNameStyle), j.nameStyle);
                    var coordinate = _this.projection(d3__namespace.polygonCentroid(j.coordinates));
                    nameData.push({
                        name: j.name,
                        fontSize: nameStyle.fontSize,
                        fontWeight: nameStyle.fontWeight,
                        color: nameStyle.color,
                        coordinate: coordinate,
                        rotate: nameStyle.rotate,
                    });
                }
                if (j.reverseCoords) {
                    reverseCoords.push(j.reverseCoords);
                }
            });
            if (coordinates.length === 0)
                return pre;
            pre.push({
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: _tslib.__spreadArray(_tslib.__spreadArray([], coordinates, true), reverseCoords, true),
                },
                properties: {
                    option: _tslib.__assign(_tslib.__assign({}, _this.option), option),
                    ids: ids,
                    originData: cur,
                    index: idx,
                },
            });
            return pre;
        }, []);
        return [pathData, nameData];
    };
    return PolygonLayer;
}(Layer["default"]));

exports["default"] = PolygonLayer;
