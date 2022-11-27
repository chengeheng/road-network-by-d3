import "./App.css";
import Map, { Layer } from "./map";

const data = {
	points: [
		{
			id: 1,
			name: "金宝大酒店",
			coordinate: [118.39053, 31.343104],
			option: {
				strokeColor: "#1176f0",
				strokeWidth: 0.5,
				fillColor: "#AC9980",
				selectColor: "#FF9400",
				selectable: true,
				stopPropagation: true,
				hoverColor: "#28B9F0",
				onClick: e => {
					console.log("pointEvent", e);
				},
				onDbClick: e => console.log("point double click", e),
				onRightClick: e => console.log("point right click", e),
			},
		},
		{
			id: 2,
			coordinate: [118.391711, 31.343728],
		},
	],
	lineStrings: [
		{
			data: [
				{
					id: 1,
					coordinates: [
						[118.390292, 31.343134],
						[118.389919, 31.342591],
					],
				},
				{
					id: 2,
					coordinates: [
						[118.390377, 31.343235],
						[118.390876, 31.343932],
					],
				},
			],
			option: {
				strokeColor: "#1176f0",
				strokeWidth: 1,
				selectColor: "#FF9400",
				selectable: true,
				hoverColor: "#28B9F0",
				stopPropagation: true,
				onClick: e => {
					console.log("polylineEvent", e);
				},
			},
		},
	],
	polygons: [
		{
			data: [
				{
					id: 1,
					coordinates: [
						[118.390355, 31.343096],
						[118.39044, 31.343219],
						[118.390714, 31.343127],
						[118.390607, 31.342961],
						[118.390355, 31.343096],
					],
				},
				{
					id: 2,
					coordinates: [
						[118.38846, 31.343562],
						[118.389811, 31.34448],
						[118.392196, 31.343566],
						[118.391024, 31.342124],
						[118.38846, 31.343562],
					],
				},
				{
					id: 3,
					coordinates: [
						[118.389803, 31.343308],
						[118.390755, 31.342757],
						[118.391033, 31.343119],
						[118.390324, 31.34357],
						[118.389798, 31.344013],
						[118.389856, 31.343639],
						[118.390054, 31.343474],
						[118.390368, 31.343524],
						[118.389803, 31.343308],
					],
				},
				// {
				// 	id: 4,
				// 	coordinates: [
				// 		[118.389798, 31.344013],
				// 		[118.389856, 31.343639],
				// 		[118.390054, 31.343474],
				// 		[118.390368, 31.343524],
				// 	],
				// },
			],
			option: {
				strokeColor: "#1176f0",
				strokeWidth: 0.5,
				fillColor: "#AC9980",
				selectColor: "#ddab15",
				selectable: true,
				hoverColor: "#28B9F0",
				onClick: (...e) => console.log("click", e),
				onRightClick: e => console.log("right click", e),
				onDbClick: e => console.log("double click", e),
			},
		},
	],
};

function App() {
	return (
		<div className="App">
			<Map
				center={[118.39067530252157, 31.343146080447582]}
				onClick={(...e) => console.log("click Map", e)}
			>
				<Layer type="Polygon" dataSource={data.polygons} />
				<Layer type="Point" dataSource={data.points} />
				<Layer type="LineString" dataSource={data.lineStrings} />
			</Map>
		</div>
	);
}

export default App;
