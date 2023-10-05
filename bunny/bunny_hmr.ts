import * as path from "path";
import { paths } from "./bunny";

// number of times we hot reloaded the api-llama.so library
declare global {
	var reloadCount: number;
}

export default async function bunny_hmr(
	init_func: (path: string) => void,
	dlpath: string = paths.LIB_PATH,
) {
	// startup -> initialize hot module reloading logic for llama.cpp

	global.reloadCount ??= 0;
	if (global.reloadCount === 0) {
		Bun.spawnSync(["rm", "-rf", path.resolve(paths.TEMPORARY_HMR_LIBRARY_DIR)]);
		Bun.spawnSync(["mkdir", path.resolve(paths.TEMPORARY_HMR_LIBRARY_DIR)]);
	}

	console.log(`Reloaded ${globalThis.reloadCount} times`);
	global.reloadCount++;
	loadLibrary(global.reloadCount);
	Bun.serve({
		fetch(req: Request) {
			console.log(`Reloaded ${globalThis.reloadCount} times`);
			global.reloadCount++;
			loadLibrary(global.reloadCount);
			return new Response();
		},
		port: process.env.HMR_SERVER_PORT,
	});

	async function loadLibrary(count: number) {
		const from = path.resolve(dlpath);
		const to = path.resolve(
			paths.TEMPORARY_HMR_LIBRARY_DIR,
			path.basename(dlpath) + count + ".so",
		);

		await Bun.spawn(["cp", from, to]).exited;
		init_func(to);
	}
}
