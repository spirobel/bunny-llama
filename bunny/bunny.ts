import { suffix } from "bun:ffi";
import * as path from "path";

export const paths = {
	TEMPORARY_HMR_LIBRARY_DIR: "/tmp/bunny-llama-reloader/",
	TEMPORARY_BUILD_OUTPUT_DIR: "/tmp/llama/",
	DEV_REPO_DIR: "llama.cpp", //relative to project root
	LIB_FILENAME: "api-llama", //filename of the library without suffix
};

export default async function bunny(
	init_func: (path: string) => void,
	llama_lib_filename: string = paths.LIB_FILENAME,
	llama_repo_dir: string = paths.DEV_REPO_DIR,
) {
	const lib_file = `${llama_lib_filename}.${suffix}`;
	const from = path.resolve(import.meta.dir, llama_repo_dir, lib_file);
	init_func(from);
}
