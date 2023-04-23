'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var d3 = require('d3');

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

var EditPolyline = /** @class */ (function () {
    function EditPolyline(options) {
        this._data = [];
        this._map = options.map;
        this._projection = options.projection;
        this._parent = options.container;
        this._path = d3__namespace.geoPath().projection(this._projection);
    }
    EditPolyline.prototype.addData = function (data) {
        this._data.push(data);
        this._draw();
    };
    EditPolyline.prototype.printCoordinates = function () {
        return this._data;
    };
    EditPolyline.prototype._drawPolygon = function () {
        var _this = this;
        var _a;
        var update = (_a = this._parent) === null || _a === void 0 ? void 0 : _a.selectAll("path").data([
            {
                type: "Feature",
                geometry: {
                    type: "MultiLineString",
                    coordinates: [this._data],
                },
                properties: {
                    id: "polygon",
                },
            },
        ]);
        update.attr("d", function (d) {
            return _this._path(d);
        });
        update
            .enter()
            .append("path")
            .attr("d", function (d) {
            return _this._path(d);
        })
            .attr("stroke", "#87ceeb")
            .attr("stroke-width", 4)
            .attr("fill", "none")
            .exit()
            .remove();
    };
    EditPolyline.prototype._drawPoints = function () {
        var _this = this;
        var _a;
        var me = this;
        var pointData = this._data.map(function (i, idx) {
            var _a = _this._projection(i), x = _a[0], y = _a[1];
            return {
                x: x,
                y: y,
                idx: idx,
            };
        });
        var draged = d3__namespace
            .drag()
            .on("start", function (e) {
            e.sourceEvent.stopPropagation();
        })
            .on("drag", function (e, d) {
            var idx = d.idx;
            me._data[idx] = me._projection.invert(d3__namespace.pointer(e, me._map));
            d3__namespace.select(this)
                .raise()
                .attr("cx", (d.x = e.x))
                .attr("cy", (d.y = e.y));
            me._drawPolygon();
        })
            .on("end", function () { });
        var update = (_a = this._parent) === null || _a === void 0 ? void 0 : _a.selectAll("circle").data(pointData);
        update
            .enter()
            .append("circle")
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .attr("r", 10)
            .attr("stroke", "#666")
            .attr("stroke-width", 1)
            .attr("fill", "transparent")
            .call(draged)
            .exit()
            .remove();
    };
    EditPolyline.prototype._draw = function () {
        this._confirmError();
        this._drawPolygon();
        this._drawPoints();
    };
    EditPolyline.prototype._confirmError = function () {
        if (this._parent === null) {
            throw new Error("线图元必须绘制在容器中");
        }
    };
    return EditPolyline;
}());

exports["default"] = EditPolyline;