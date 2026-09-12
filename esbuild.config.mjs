import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");
const isProduction = process.argv.includes("--production");

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
	entryPoints: ["src/extension.ts"],
	bundle: true,
	outfile: "dist/extension.js",
	external: ["vscode"],
	format: "cjs",
	platform: "node",
	target: "node20",
	sourcemap: !isProduction,
	minify: isProduction,
	logLevel: "info",
};

async function main() {
	if (isWatch) {
		const ctx = await esbuild.context(buildOptions);
		await ctx.watch();
		console.log("[Tree Builder] Watching for changes...");
	} else {
		await esbuild.build(buildOptions);
		console.log("[Tree Builder] Build completed successfully.");
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
