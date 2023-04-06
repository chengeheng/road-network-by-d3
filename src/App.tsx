import React, { useState } from "react";
import { useEffect } from "react";
import "./App.css";

import Map from "./map";
import {
	PointLayer,
	PolygonLayer,
	PolyLineLayer,
	LabelLayer,
	PointDataSourceProps,
	PolygonDataSourceProps,
	PolyLineDataSourceProps,
	StrokeLineType,
	LabelDataSourceProps,
} from "./map";

const focusCoords: [number, number][] = [
	[118.391213, 31.343501],
	[118.39137, 31.343408],
	[118.391208, 31.343185],
	[118.391047, 31.343258],
	[118.391213, 31.343501],
];
const focusPolygonsData: PolygonDataSourceProps = {
	data: [
		{
			id: 12,
			coordinates: focusCoords,
		},
	],
	option: {
		style: {
			strokeColor: "#ffd000",
			strokeWidth: 0.5,
			fillColor: "#ffd000",
		},
		hoverStyle: {
			fillColor: "#b3ff00",
		},
		selectable: true,
	},
};

const oldLabelData: LabelDataSourceProps[] = [
	{
		id: 1,
		name: "博园路",
		coordinate: [118.39053, 31.343014],
		option: {
			style: {
				color: "#1176f0",
				// strokeColor: "#ffffff",
				// strokeWidth: 3,
			},
			rotate: 40,
			stopPropagation: true,
			onClick: (e: any) => {
				console.log("label click", e);
			},
			onDbClick: (e: any) => console.log("label double click", e),
			onRightClick: (e: any) => console.log("label right click", e),
		},
	},
];

const oldPointsData: PointDataSourceProps[] = [
	{
		id: 1,
		name: "金宝大酒店",
		coordinate: [118.39053, 31.343104],
		option: {
			offset: [0, 18],
			rotate: 0,
			hoverColor: "#333333",
			stopPropagation: true,
			onClick: (e: any) => {
				console.log("pointEvent", e);
			},
			onDbClick: (e: any) => console.log("point double click", e),
			onRightClick: (e: any) => console.log("point right click", e),
		},
	},
	{
		id: 2,
		name: "朋联国际购物中心",
		coordinate: [121.23744, 31.246965],
		icon: "https://picnew9.photophoto.cn/20141026/ps-huizhiapptubiaotupian-11487481_1.jpg",
		option: {
			stopPropagation: true,
			onClick: (e: any) => {
				console.log("pointEvent", e);
			},
			onDbClick: (e: any) => console.log("point double click", e),
			onRightClick: (e: any) => console.log("point right click", e),
			onHover: (e: any) => console.log("hover", e),
		},
	},
];
const oldPolyLinesData: PolyLineDataSourceProps[] = [
	{
		data: [
			{
				id: 1,
				coordinates: [
					[121.243791, 31.248724],
					[121.240306, 31.248107],
					[121.236839, 31.247482],
					[121.231539, 31.246671],
				],
			},
			// {
			// 	id: 2,
			// 	coordinates: [
			// 		[118.390755, 31.342375],
			// 		[118.390579, 31.341959],
			// 		[118.390579, 31.341635],
			// 		[118.390755, 31.341373],
			// 	],
			// },
			// {
			// 	id: 3,
			// 	coordinates: [
			// 		[121.313697, 31.510286],
			// 		[121.315422, 31.221684],
			// 	],
			// },
		],
		option: {
			style: {
				strokeColor: "#1176f0",
				strokeWidth: 20,
				// strokeType: StrokeLineType.dotted,
			},
			hoverStyle: {
				strokeColor: "#333333",
			},
			selectStyle: {
				strokeColor: "red",
			},
			selectable: true,
			onClick: (e: any) => {
				console.log(e);
			},
			onHover: (e: any) => {
				console.log("hover polyline", e);
			},
		},
	},
];
const oldPolygonsData: PolygonDataSourceProps[] = [
	focusPolygonsData,
	{
		data: [
			{
				id: 1,
				coordinates: [
					[121.233766, 31.248558],
					[121.233515, 31.249434],
					[121.236219, 31.249743],
					[121.236609, 31.247779],
					[121.236484, 31.247567],
					[121.233672, 31.247103],
					[121.233519, 31.247578],
					[121.233155, 31.247524],
					[121.232908, 31.248392],
					[121.233766, 31.248558],
				],
				name: "华新人民公园",
			},
			{
				id: 2,
				coordinates: [
					[118.391662, 31.342664],
					[118.392619, 31.342653],
					[118.392619, 31.342206],
					[118.391729, 31.342136],
					[118.391662, 31.342664],
				],
				name: "广场A",
				nameStyle: {
					fontSize: 24,
					fontWeight: 600,
					color: "red",
					rotate: 50,
				},
			},
		],
		option: {
			style: {
				strokeColor: "#1176f0",
				strokeWidth: 0.5,
				fillColor: "skyblue",
			},
			hoverStyle: {
				fillColor: "#333333",
			},
			selectStyle: {
				fillColor: "red",
				strokeColor: "yellow",
			},
			selectable: true,
			onClick: (e: any) => {
				console.log(e);
			},
			onHover: (e: any) => {
				console.log("hover polygon", e);
			},
		},
	},
];

const newPointsData: PointDataSourceProps[] = [
	{
		id: 1,
		name: "樱日本料理",
		coordinate: [118.392084, 31.342117],
		option: {
			stopPropagation: true,
			onClick: (e: any) => {
				console.log("pointEvent", e);
			},
			onDbClick: (e: any) => console.log("point double click", e),
			onRightClick: (e: any) => console.log("point right click", e),
		},
	},
];
const newPolyLinesData: PolyLineDataSourceProps[] = [
	{
		data: [
			{
				id: 3,
				coordinates: [
					[118.391891, 31.342656],
					[118.391918, 31.341353],
				],
			},
			{
				id: 2,
				coordinates: [
					[118.390755, 31.342375],
					[118.390579, 31.341959],
					[118.390579, 31.341635],
					[118.390755, 31.341373],
				],
			},
		],
		option: {
			style: {
				strokeColor: "#1176f0",
				strokeWidth: 1,
				strokeType: StrokeLineType.dotted,
			},
			hoverStyle: {
				strokeColor: "#28B9F0",
			},
			selectable: true,
			onClick: (e: any) => {
				console.log(e);
			},
		},
	},
];
const newLabelData: LabelDataSourceProps[] = [
	{
		id: 2,
		name: "中国电信",
		coordinate: [118.39248, 31.341504],
		option: {
			style: {
				color: "#333",
			},
			rotate: 40,
			stopPropagation: true,
			onClick: (e: any) => {
				console.log("label click", e);
			},
			onDbClick: (e: any) => console.log("label double click", e),
			onRightClick: (e: any) => console.log("label right click", e),
		},
	},
];
const newPolygonsData: PolygonDataSourceProps[] = [
	focusPolygonsData,
	{
		data: [
			{
				id: 1,
				name: "7栋",
				coordinates: [
					[118.392003, 31.342938],
					[118.392533, 31.342957],
					[118.392542, 31.342838],
					[118.392021, 31.342811],
					[118.392003, 31.342938],
				],
			},
			{
				id: 2,
				coordinates: [
					[118.391999, 31.342063],
					[118.392578, 31.342078],
					[118.392574, 31.341943],
					[118.392138, 31.341916],
					[118.392152, 31.341608],
					[118.392596, 31.3416],
					[118.392623, 31.341484],
					[118.392053, 31.341461],
					[118.391999, 31.342063],
				],
			},
		],
		option: {
			style: {
				strokeColor: "#1176f0",
				strokeWidth: 0.5,
			},
			hoverStyle: {
				fillColor: "#28B9F0",
			},
			selectable: true,
			onClick: (e: any) => {
				console.log(e);
			},
		},
	},
];

function App() {
	const [pointLayer, setPointLayer] = useState<PointLayer>();
	const [polygonLayer, setPolygonLayer] = useState<PolygonLayer>();
	const [polyLineLayer, setPolyLineLayer] = useState<PolyLineLayer>();
	const [labelLayer, setLabelLayer] = useState<LabelLayer>();
	const [map, setMap] = useState<Map>();
	useEffect(() => {
		const map = new Map("container", {
			// center: [118.39057, 31.342792],
			center: [121.23744, 31.246965],
			level: 10,
			onClick: (...e) => console.log("click map", e),
		});
		const pointlayer = new PointLayer(oldPointsData, { hoverColor: "#e3e3e3" });
		const polylayer = new PolygonLayer(oldPolygonsData);
		const linelayer = new PolyLineLayer(oldPolyLinesData);
		const labellayer = new LabelLayer(oldLabelData);
		map.addLayer(polylayer);
		map.addLayer(linelayer);
		map.addLayer(pointlayer);
		map.addLayer(labellayer);
		setPointLayer(pointlayer);
		setPolygonLayer(polylayer);
		setPolyLineLayer(linelayer);
		setLabelLayer(labellayer);
		setMap(map);
	}, []);

	const buttons = [
		{
			label: "更新点数据",
			onClick: () => {
				if (!pointLayer) return;
				pointLayer.updateData(newPointsData);
			},
		},
		{
			label: "更新文字数据",
			onClick: () => {
				if (!labelLayer) return;
				labelLayer.updateData(newLabelData);
			},
		},
		{
			label: "更新线数据",
			onClick: () => {
				if (!polyLineLayer) return;
				polyLineLayer.updateData(newPolyLinesData);
			},
		},
		{
			label: "更新面数据",
			onClick: () => {
				if (!polygonLayer) return;
				polygonLayer.updateData(newPolygonsData);
			},
		},
		{
			label: "聚焦点",
			onClick: () => {
				if (!map) return;
				map.moveTo([121.313697, 31.510286]);
			},
		},
		{
			label: "聚焦点2",
			onClick: () => {
				if (!map) return;
				map.moveTo([121.315422, 31.221684]);
			},
		},
		{
			label: "聚焦区域",
			onClick: () => {
				if (!map) return;
				map.focusOnView(focusCoords);
			},
		},
		{
			label: "隐藏点图层",
			onClick: () => {
				if (!pointLayer) return;
				pointLayer.hide();
			},
		},
		{
			label: "隐藏文字图层",
			onClick: () => {
				if (!labelLayer) return;
				labelLayer.hide();
			},
		},
		{
			label: "隐藏线图层",
			onClick: () => {
				if (!polyLineLayer) return;
				polyLineLayer.hide();
			},
		},
		{
			label: "隐藏面图层",
			onClick: () => {
				if (!polygonLayer) return;
				polygonLayer.hide();
			},
		},
		{
			label: "显示所有图层",
			onClick: () => {
				if (!map) return;
				map.showLayer();
			},
		},
		{
			label: "隐藏所有图层",
			onClick: () => {
				if (!map) return;
				map.hideLayer();
			},
		},
		{
			label: "隐藏点图层所有功能",
			onClick: () => {
				if (!pointLayer) return;
				pointLayer.disableLayerFunc();
			},
		},
		{
			label: "恢复点图层所有功能",
			onClick: () => {
				if (!pointLayer) return;
				pointLayer.enableLayerFunc();
			},
		},
		{
			label: "隐藏线图层所有功能",
			onClick: () => {
				if (!polyLineLayer) return;
				polyLineLayer.disableLayerFunc();
			},
		},
		{
			label: "恢复线图层所有功能",
			onClick: () => {
				if (!polyLineLayer) return;
				polyLineLayer.enableLayerFunc();
			},
		},
		{
			label: "隐藏面图层所有功能",
			onClick: () => {
				if (!polygonLayer) return;
				polygonLayer.disableLayerFunc();
			},
		},
		{
			label: "恢复面图层所有功能",
			onClick: () => {
				if (!polygonLayer) return;
				polygonLayer.enableLayerFunc();
			},
		},
		{
			label: "选中所有面",
			onClick: () => {
				if (!polygonLayer) return;
				polygonLayer.setSelectType("all");
			},
		},
		{
			label: "选中路段面",
			onClick: () => {
				if (!polygonLayer) return;
				polygonLayer.setSelectType("path");
			},
		},
		{
			label: "选中所有线",
			onClick: () => {
				if (!polyLineLayer) return;
				polyLineLayer.setSelectType("all");
			},
		},
		{
			label: "选中路段线",
			onClick: () => {
				if (!polyLineLayer) return;
				polyLineLayer.setSelectType("path");
			},
		},
		{
			label: "更改地图层级到最大",
			onClick: () => {
				if (!map) return;
				map.setLevel(20);
			},
		},
		{
			label: "更改地图层级到最小",
			onClick: () => {
				if (!map) return;
				map.setLevel(1);
			},
		},
		{
			label: "调用画线工具",
			onClick: () => {
				if (!map) return;
				map.paintPolygon();
			},
		},
	];

	return (
		<div className="App" id="container">
			<div style={{ position: "absolute", zIndex: 10, top: 10, left: 10 }}>
				{buttons.map((i, index) => (
					<button key={index + 1} className="button" onClick={i.onClick}>
						{i.label}
					</button>
				))}
			</div>
		</div>
	);
}

export default App;
