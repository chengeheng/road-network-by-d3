import React from "react";
import { useEffect } from "react";
import "./App.css";

import Map from "./map";
import PointLayer, { PointDataSource } from "./map/PointLayer";
import PolygonLayer, { PolygonDataSource } from "./map/PolygonLayer";
import PolyLineLayer, { PolyLineDataSource, StrokeLineType } from "./map/PolyLineLayer";

// const data = {
//   points: [
//       {
//           id: 1,
//           name: "金宝大酒店",
//           coordinate: [118.39053, 31.343104],
//           option: {
//               strokeColor: "#1176f0",
//               strokeWidth: 0.5,
//               fillColor: "#AC9980",
//               selectColor: "#FF9400",
//               selectable: true,
//               stopPropagation: true,
//               hoverColor: "#28B9F0",
//               onClick: e => {
//                   console.log("pointEvent", e);
//               },
//               onDbClick: e => console.log("point double click", e),
//               onRightClick: e => console.log("point right click", e),
//           },
//       },
//       {
//           id: 2,
//           coordinate: [118.391711, 31.343728],
//       },
//   ],
//   lineStrings: [
//       {
//           data: [
//               {
//                   id: 1,
//                   coordinates: [
//                       [118.390292, 31.343134],
//                       [118.389919, 31.342591],
//                   ],
//               },
//               {
//                   id: 2,
//                   coordinates: [
//                       [118.390377, 31.343235],
//                       [118.390876, 31.343932],
//                   ],
//               },
//           ],
//           option: {
//               strokeColor: "#1176f0",
//               strokeWidth: 1,
//               selectColor: "#FF9400",
//               selectable: true,
//               hoverColor: "#28B9F0",
//               stopPropagation: true,
//               onClick: e => {
//                   console.log("polylineEvent", e);
//               },
//           },
//       },
//   ],
//   polygons: [
//       {
//           data: [
//               {
//                   id: 1,
//                   coordinates: [
//                       [118.390355, 31.343096],
//                       [118.39044, 31.343219],
//                       [118.390714, 31.343127],
//                       [118.390607, 31.342961],
//                       [118.390355, 31.343096],
//                   ],
//               },
//               {
//                   id: 2,
//                   coordinates: [
//                       [118.39044, 31.343219],
//                       [118.390912, 31.343898],
//                       [118.39115, 31.343813],
//                       [118.390714, 31.343127],
//                       [118.39044, 31.343219],
//                   ],
//               },
//           ],
//           option: {
//               strokeColor: "#1176f0",
//               strokeWidth: 0.5,
//               fillColor: "#AC9980",
//               selectColor: "#ddab15",
//               selectable: true,
//               hoverColor: "#28B9F0",
//               onClick: (...e) => console.log("click", e),
//               onRightClick: e => console.log("right click", e),
//               onDbClick: e => console.log("double click", e),
//           },
//       },
//   ],
// };

function App() {
	useEffect(() => {
		const data: PolygonDataSource[] = [
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

		const lineData: PolyLineDataSource[] = [
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

		const points: PointDataSource[] = [
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
		const map = new Map("container", { center: [118.391262, 31.342047] });
		const layer = new PolygonLayer(data);
		const lineLayer = new PolyLineLayer(lineData);
		const pointLayer = new PointLayer(points);
		map.addLayer(layer);
		map.addLayer(lineLayer);
		map.addLayer(pointLayer);
	}, []);

	return <div className="App" id="container"></div>;
}

export default App;
