import * as path from "path";

export const paths = {
	TEMPORARY_HMR_LIBRARY_DIR: "/tmp/bunny-llama-reloader/",
	LIB_PATH: "llama.cpp/api-llama.so",
};

export default async function bunny(
	init_func: (path: string) => void,
	dlpath: string = paths.LIB_PATH,
) {
	const from = path.resolve(dlpath);
	init_func(from);
}
