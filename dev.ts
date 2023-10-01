import bunny_hmr from "./bunny/bunny_hmr";
import { global_llama } from "./bunny/example_init_functions/global_llama";

function init(path: string) {
	global_llama(path);
}
bunny_hmr(init);
