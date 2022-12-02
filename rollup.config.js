import ts from "rollup-plugin-typescript2";
import nodeResolve from "@rollup/plugin-node-resolve";
import image from "@rollup/plugin-image";
import path from "path";
import externals from "rollup-plugin-node-externals";

import pkg from "./package.json";

const config = {
	input: "src/index.ts",
	output: {
		dir: path.dirname(pkg.module),
		format: "cjs",
		// format: "esm",
		name: pkg.name,
		exports: "named", // 指定导出模式（自动、默认、命名、无）

		preserveModules: true, // 保留模块结构
		preserveModulesRoot: "src", // 将保留的模块放在根级别的此路径下
	},
	plugins: [
		externals({ devDeps: false }),
		image(),
		nodeResolve(),
		ts({ outDir: "lib", declaration: true, declarationDir: "lib" }),
	],
};

export default config;
