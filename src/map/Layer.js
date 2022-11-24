import React from "react";
import PolygonLayer from "./PolygonLayer";
import PointLayer from "./PointLayer";
import LineLayer from "./LineLayer";

const Layer = React.memo(props => {
	const { type = "Polygon", ...rest } = props;
	switch (type) {
		case "Polygon":
			return <PolygonLayer {...rest} />;
		case "LineString":
			return <LineLayer {...rest} />;
		case "Point":
			return <PointLayer {...rest} />;
		default:
			return <></>;
	}
});

export default Layer;
