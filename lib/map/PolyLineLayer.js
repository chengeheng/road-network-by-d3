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
    selectType: "link",
};
var PolyLineLayer = /** @class */ (function (_super) {
    _tslib.__extends(PolyLineLayer, _super);
    function PolyLineLayer(dataSource, option) {
        if (option === void 0) { option = defaultOption; }
        var _this = _super.call(this, Layer.LayerType.PolygonLayer, option) || this;
        _this.data = dataSource;
        _this.option = _tslib.__assign(_tslib.__assign({}, defaultOption), option);
        _this.clickCount = 0;
        _this.selectIndex = new Map();
        _this._selectType = _this.option.selectType;
        _this._allIndex = new Map();
        _this._hoverIndex = new Map();
        _this.length = dataSource.length;
        return _this;
    }
    PolyLineLayer.prototype.init = function (g, projection) {
        _super.prototype.init.call(this, g, projection);
        this.path = d3__namespace.geoPath().projection(projection);
        this.container = d3__namespace
            .select(g)
            .append("g")
            .attr("id", "polyline-layer-".concat(this.makeRandomId()));
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
    PolyLineLayer.prototype.remove = function () {
        this.container.remove();
    };
    /**
     * 显示当前图层
     */
    PolyLineLayer.prototype.show = function () {
        this.container.style("display", "inline");
    };
    /**
     * 隐藏当前图层
     */
    PolyLineLayer.prototype.hide = function () {
        this.container.style("display", "none");
    };
    PolyLineLayer.prototype.enableLayerFunc = function () {
        this.container.style("pointer-events", "inherit");
    };
    PolyLineLayer.prototype.disableLayerFunc = function () {
        this.container.style("pointer-events", "none");
    };
    PolyLineLayer.prototype.updateData = function (data) {
        this.data = data;
        this.selectIndex = new Map();
        this.baseLayer.selectAll("path").remove();
        this.selectLayer.selectAll("path").remove();
        this.hoverLayer.selectAll("path").remove();
        this.draw();
    };
    PolyLineLayer.prototype.setSelectType = function (type) {
        this._selectType = type;
    };
    PolyLineLayer.prototype.draw = function () {
        var _this = this;
        this.baseLayer
            .selectAll("path")
            .data(this.formatData(this.data, function (e, outerIndex, innerIndex) {
            var _a;
            if (_this._allIndex.has(outerIndex)) {
                (_a = _this._allIndex.get(outerIndex)) === null || _a === void 0 ? void 0 : _a.add(innerIndex);
            }
            else {
                _this._allIndex.set(outerIndex, new Set([innerIndex]));
            }
            return true;
        }))
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
                return _this._isPointInLine(i, d3__namespace.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
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
                        _this.selectLayer.select("*").remove();
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
                var index = coordinates.findIndex(function (i) {
                    return _this._isPointInLine(i, d3__namespace.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
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
            var index = d.geometry.coordinates.findIndex(function (i) {
                return _this._isPointInLine(i, d3__namespace.pointer(e, _this.container.node()), _this.projection, d.properties.option.strokeWidth);
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
    };
    PolyLineLayer.prototype.drawSelectLayer = function () {
        var _this = this;
        this.selectLayer.selectAll("*").remove();
        var pathData = this.formatData(this.data, function (e, idx, index) {
            if (!_this.selectIndex.get(idx)) {
                return false;
            }
            else {
                return _this.selectIndex.get(idx).has(index);
            }
        });
        this.selectLayer
            .selectAll("path")
            .data(pathData)
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
    PolyLineLayer.prototype.drawHoverLayer = function () {
        var _this = this;
        this.hoverLayer.selectAll("*").remove();
        var pathData = this.formatData(this.data, function (e, idx, index) {
            if (!_this._hoverIndex.get(idx)) {
                return false;
            }
            else {
                return _this._hoverIndex.get(idx).has(index);
            }
        });
        this.hoverLayer
            .selectAll("path")
            .data(pathData)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("stroke", function (l) { return l.properties.option.hoverColor; })
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
    PolyLineLayer.prototype.formatData = function (data, dataFilter) {
        var _this = this;
        return data.reduce(function (pre, cur, idx) {
            var _a = cur.data, data = _a === void 0 ? [] : _a, _b = cur.option, option = _b === void 0 ? {} : _b;
            var ids = [];
            var coordinates = [];
            data.forEach(function (j, innerIndex) {
                if (dataFilter) {
                    if (!dataFilter(j, idx, innerIndex)) {
                        return;
                    }
                }
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
                    index: idx,
                },
            });
            return pre;
        }, []);
    };
    PolyLineLayer.prototype.combineIndex = function (idxs, index, // 外部index
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
    // private _PointToLine(
    // 	point: [number, number],
    // 	lines: [[number, number], [number, number]]
    // ): number {
    // 	const [x, y] = point;
    // 	const [x1, y1] = lines[0];
    // 	const [x2, y2] = lines[1];
    // 	const length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    // 	const areas = Math.abs((x1 - x) * (y2 - y) - (y1 - y) * (x2 - x));
    // 	return areas / length;
    // }
    PolyLineLayer.prototype._insideInStandardRect = function (_a, _b, _c) {
        var x1 = _a[0], y1 = _a[1];
        var x2 = _b[0], y2 = _b[1];
        var x = _c[0], y = _c[1];
        if (y < y1 || y > y2)
            return false;
        if (x1 < x2) {
            if (x < x1 || x > x2)
                return false;
        }
        else {
            if (x > x1 || x < x2)
                return false;
        }
        return true;
    };
    PolyLineLayer.prototype._insideInRect = function (_a, _b, _c, height) {
        var x1 = _a[0], y1 = _a[1];
        var x2 = _b[0], y2 = _b[1];
        var x = _c[0], y = _c[1];
        if (y1 === y2) {
            return this._insideInStandardRect([x1, y1 - height], [x2, y1 + height], [x, y]);
        }
        var l = y2 - y1;
        var r = x2 - x1;
        var s = Math.sqrt(l * l + r * r);
        var sin = l / s;
        var cos = r / s;
        var x1r = x1 * cos + y1 * sin;
        var y1r = y1 * cos - x1 * sin;
        var x2r = x2 * cos + y2 * sin;
        var y2r = y2 * cos - x2 * sin;
        var xr = x * cos + y * sin;
        var yr = y * cos - x * sin;
        return this._insideInStandardRect([x1r, y1r - height], [x2r, y2r + height], [xr, yr]);
    };
    PolyLineLayer.prototype._isPointInLine = function (coordinates, point, projection, lineWidth) {
        if (coordinates.length <= 1)
            return false;
        var lineArr = coordinates.map(projection);
        for (var i = 1; i < lineArr.length; i++) {
            if (this._insideInRect(lineArr[i], lineArr[i - 1], point, lineWidth / 2)) {
                return true;
            }
        }
        return false;
    };
    return PolyLineLayer;
}(Layer["default"]));

exports["default"] = PolyLineLayer;
