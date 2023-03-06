const zooms: number[] = [
	// 1,

	1 / 2,
	1 / 4,
	1 / 10,
	1 / 20,
	1 / 30,

	1 / 40,
	1 / 60,
	1 / 80,
	1 / 100,
	1 / 130,

	1 / 160,
	1 / 200,
	1 / 300,
	1 / 400,
	1 / 600,

	1 / 800,
	1 / 1000,
	1 / 1500,
	1 / 2000,
	1 / 3000,

	// 1 / 4000,
].map(i => i * 20);

const zoomsTotal = zooms.length;

export { zooms, zoomsTotal };
