import { watch } from "fs/promises";
import * as path from "path";
import { suffix } from "bun:ffi";
import { paths } from "./bunny";

// number of times we hot reloaded the api-llama.so library
declare global {
	var reloadCount: number;
}

export default async function bunny_hmr(
	init_func: (path: string) => void,
	llama_lib_filename: string = paths.LIB_FILENAME,
) {
	const lib_file = `${llama_lib_filename}.${suffix}`;
	// startup -> initialize hot module reloading logic for llama.cpp

	global.reloadCount ??= 0;
	if (global.reloadCount === 0) {
		Bun.spawnSync(["rm", "-rf", path.resolve(paths.TEMPORARY_HMR_LIBRARY_DIR)]);
		Bun.spawnSync(["mkdir", path.resolve(paths.TEMPORARY_HMR_LIBRARY_DIR)]);
	}

	console.log(`Reloaded ${globalThis.reloadCount} times`);
	global.reloadCount++;
	loadLibrary(global.reloadCount);
	const watcher = watch(path.resolve(paths.TEMPORARY_BUILD_OUTPUT_DIR));

	for await (const event of watcher) {
		console.log(`Detected ${event.eventType} in ${event.filename}`);
		if (event.filename === lib_file) {
			console.log("huhu ", event.filename);
			global.reloadCount++;
			loadLibrary(global.reloadCount);
		}
	}
	async function loadLibrary(count: number) {
		const tmp_lib_file = `${llama_lib_filename}${count}.${suffix}`;
		const from = path.resolve(paths.TEMPORARY_BUILD_OUTPUT_DIR, lib_file);
		const to = path.resolve(paths.TEMPORARY_HMR_LIBRARY_DIR, tmp_lib_file);

		await Bun.spawn(["cp", from, to]).exited;
		init_func(to);
	}
}
