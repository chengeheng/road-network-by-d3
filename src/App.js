import "./App.css";
import Map from "./map/index";
import Layer from "./map/Layer";

const data = {
  point: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [118.343836, 31.322577],
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [118.390355, 31.343096],
      },
      properties: {},
    },
  ],
  polygons: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [118.390355, 31.343096],
            [118.39044, 31.343219],
            [118.390714, 31.343127],
            [118.390607, 31.342961],
            [118.390355, 31.343096],
          ],
          [
            [118.39044, 31.343219],
            [118.390912, 31.343898],
            [118.39115, 31.343813],
            [118.390714, 31.343127],
            [118.39044, 31.343219],
          ],
        ],
      },
      properties: {
        option: {
          strokeColor: "#1176f0",
          strokeWidth: 0.5,
          fillColor: "#AC9980",
          selectColor: "#ddab15",
          selectable: true,
          onSelect: (e) => console.log("select", e),
          onClick: (e) => console.log("click", e),
        },
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [118.389848, 31.343401],
            [118.389893, 31.343466],
            [118.39044, 31.343219],
            [118.390355, 31.343096],
            [118.389848, 31.343401],
          ],
        ],
      },
    },
    // {
    //   type: "Feature",
    //   geometry: {
    //     type: "MultiLineString",
    //     coordinates: [
    //       [
    //         [118.377936, 31.338339],
    //         [118.432481, 31.335439],
    //         [118.458101, 31.320973],
    //         [118.343836, 31.322577],
    //         [118.377936, 31.338339],
    //       ],
    //     ],
    //   },
    // },
  ],
};

function App() {
  return (
    <div className="App">
      <Map
        center={[118.39067530252157, 31.343146080447582]}
        onClick={(e) => console.log("click Map", e)}
      >
        <Layer type="Polygon" dataSource={data.polygons} />
      </Map>
    </div>
  );
}

export default App;
