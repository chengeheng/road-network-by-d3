import React, { useState } from "react";
import { useEffect } from "react";
import "./App.css";

import Map from "./map/Map";
import PointLayer, { PointDataSource } from "./map/PointLayer";
import PolygonLayer, { PolygonDataSource } from "./map/PolygonLayer";
import PolyLineLayer, { PolyLineDataSource, StrokeLineType } from "./map/PolyLineLayer";

const focusCoords: [number, number][] = [
	[118.391213, 31.343501],
	[118.39137, 31.343408],
	[118.391208, 31.343185],
	[118.391047, 31.343258],
	[118.391213, 31.343501],
];
const focusPolygonsData: PolygonDataSource = {
	data: [
		{
			id: 12,
			coordinates: focusCoords,
		},
	],
	option: {
		strokeColor: "#ffd000",
		strokeWidth: 0.5,
		fillColor: "#ffd000",
		hoverColor: "#b3ff00",
	},
};

const oldPointsData: PointDataSource[] = [
	{
		id: 1,
		name: "金宝大酒店",
		coordinate: [118.39053, 31.343104],
		option: {
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
		coordinate: [118.391581, 31.34204],
	},
];
const oldPolyLinesData: PolyLineDataSource[] = [
	{
		data: [
			{
				id: 1,
				coordinates: [
					[118.39057, 31.342792],
					[118.390031, 31.342121],
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
			strokeColor: "#1176f0",
			strokeWidth: 1,
			selectable: true,
			hoverColor: "#28B9F0",
			strokeType: StrokeLineType.dotted,
			onClick: (e: any) => {
				console.log(e);
			},
		},
	},
];
const oldPolygonsData: PolygonDataSource[] = [
	focusPolygonsData,
	{
		data: [
			{
				id: 1,
				coordinates: [
					[118.390562, 31.342822],
					[118.391828, 31.34268],
					[118.391842, 31.341353],
					[118.390764, 31.341311],
					[118.390562, 31.342822],
				],
				reverseCoords: [
					[118.39102, 31.342313],
					[118.39102, 31.34172],
					[118.391572, 31.341739],
					[118.391451, 31.342275],
					[118.39102, 31.342313],
				],
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
			},
		],
		option: {
			strokeColor: "#1176f0",
			strokeWidth: 0.5,
			selectable: true,
			hoverColor: "#28B9F0",
			onClick: (e: any) => {
				console.log(e);
			},
		},
	},
];

const newPointsData: PointDataSource[] = [
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
const newPolyLinesData: PolyLineDataSource[] = [
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
			strokeColor: "#1176f0",
			strokeWidth: 1,
			selectable: true,
			hoverColor: "#28B9F0",
			strokeType: StrokeLineType.dotted,
			onClick: (e: any) => {
				console.log(e);
			},
		},
	},
];
const newPolygonsData: PolygonDataSource[] = [
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
			strokeColor: "#1176f0",
			strokeWidth: 0.5,
			selectable: true,
			hoverColor: "#28B9F0",
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
	const [map, setMap] = useState<Map>();
	useEffect(() => {
		const map = new Map("container", {
			center: [118.39053, 31.343104],
			onClick: e => console.log(e),
		});
		const pointlayer = new PointLayer(oldPointsData);
		const polylayer = new PolygonLayer(oldPolygonsData);
		const linelayer = new PolyLineLayer(oldPolyLinesData);
		map.addLayer(polylayer);
		map.addLayer(linelayer);
		map.addLayer(pointlayer);
		setPointLayer(pointlayer);
		setPolygonLayer(polylayer);
		setPolyLineLayer(linelayer);
		setMap(map);
	}, []);

	return (
		<div className="App" id="container">
			<div style={{ position: "absolute", zIndex: 10, top: 10, left: 10 }}>
				<button
					onClick={() => {
						if (!pointLayer) return;
						pointLayer.updateData(newPointsData);
					}}
				>
					更新点数据
				</button>
				<button
					style={{ marginLeft: "5px" }}
					onClick={() => {
						if (!polyLineLayer) return;
						polyLineLayer.updateData(newPolyLinesData);
					}}
				>
					更新线数据
				</button>
				<button
					style={{ marginLeft: "5px" }}
					onClick={() => {
						if (!polygonLayer) return;
						polygonLayer.updateData(newPolygonsData);
					}}
				>
					更新面数据
				</button>
				<button
					style={{ marginLeft: "5px" }}
					onClick={() => {
						if (!map) return;
						map.moveTo([118.391581, 31.34204]);
					}}
				>
					更换地图中心点
				</button>
				<button
					style={{ marginLeft: "5px" }}
					onClick={() => {
						if (!map) return;
						map.focusOnView(focusCoords);
					}}
				>
					聚焦区域
				</button>
			</div>
		</div>
	);
}

export default App;
