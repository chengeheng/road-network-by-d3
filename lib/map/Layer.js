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

exports.LayerType = void 0;
(function (LayerType) {
    LayerType[LayerType["PointLayer"] = 0] = "PointLayer";
    LayerType[LayerType["PolygonLayer"] = 1] = "PolygonLayer";
    LayerType[LayerType["PolyLineLayer"] = 2] = "PolyLineLayer";
})(exports.LayerType || (exports.LayerType = {}));
var Layer = /** @class */ (function () {
    function Layer(type, options) {
        this.type = type;
        this.projection = d3__namespace.geoMercator();
    }
    Layer.prototype.init = function (g, projection) {
        this.map = g;
        this.projection = projection;
    };
    Layer.prototype.remove = function () { };
    Layer.prototype.updateData = function (data) { };
    // 显示和隐藏图层
    Layer.prototype.show = function () { };
    Layer.prototype.hide = function () { };
    // 打开和关系图层所有功能，只做展示使用
    Layer.prototype.enableLayerFunc = function () { };
    Layer.prototype.disableLayerFunc = function () { };
    Layer.prototype.makeRandomId = function () {
        var chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = chars.length;
        var code = "";
        for (var i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return code;
    };
    Layer.prototype.calcuteTextWidth = function (text, fontSize) {
        if (fontSize === void 0) { fontSize = "12px"; }
        console.log(text, fontSize);
        var span = document.getElementById("__getwidth");
        if (!span) {
            span = document.createElement("span");
        }
        span.id = "__getwidth";
        span.style.visibility = "hidden";
        span.style.fontSize = fontSize;
        span.style.whiteSpace = "nowrap";
        span.innerText = text;
        document.body.appendChild(span);
        var width = span.offsetWidth;
        var height = span.offsetHeight;
        document.body.removeChild(span);
        return [width, height];
    };
    return Layer;
}());

exports["default"] = Layer;
