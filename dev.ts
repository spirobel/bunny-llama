import bunny_hmr from "./bunny/bunny_hmr";
import { global_llama } from "./bunny/example_init_functions/global_llama";

function init(path: string) {
	global_llama(path);
	if (!llama._model) {
		llama.load_model(
			`llama --log-disable --model models/model.gguf --ctx-size 2048 `,
		);
	}

	console.log(llama._model);
	llama.prompt(`Hello my name is 🐰`);
}
bunny_hmr(init, "../llama.cpp/api-llama.so");
