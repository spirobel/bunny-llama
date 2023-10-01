import bunny_hmr from "./bunny/bunny_hmr";
import { global_llama } from "./bunny/example_init_functions/global_llama";

function init(path: string) {
	global_llama(path);
	if (!llama._model) {
		llama.load_model("llama --model models/model.gguf")
	}
	llama.prompt("Hello this is a test")

}
bunny_hmr(init, "../llama.cpp/api-llama.so");