import "./App.css";
import Map from "./map/index";
import Layer from "./map/Layer";

const data = {
	points: [
		{
			id: 1,
			name: "金宝大酒店",
			coordinate: [118.39053, 31.343104],
		},
		{
			id: 2,
			coordinate: [118.391711, 31.343728],
		},
	],
	lineStrings: [
		{
			type: "Feature",
			geometry: {
				type: "MultiLineString",
				coordinates: [
					[
						[118.390355, 31.343096],
						[118.390607, 31.342961],
						[118.390184, 31.342456],
						[118.389996, 31.342529],
						[118.390355, 31.343096],
					],
				],
			},
			properties: {
				option: {
					strokeColor: "#1176f0",
					strokeWidth: 0.5,
					fillColor: "#AC9980",
					selectColor: "#FF9400",
					selectable: true,
					hoverColor: "#28B9F0",
					onSelect: e => console.log("select", e),
					onClick: e => console.log("click", e),
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
						[118.39044, 31.343219],
						[118.390912, 31.343898],
						[118.39115, 31.343813],
						[118.390714, 31.343127],
						[118.39044, 31.343219],
					],
				},
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
			</Map>
		</div>
	);
}

export default App;
