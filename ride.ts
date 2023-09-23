import { dlopen, FFIType, suffix } from "bun:ffi";

const lib = dlopen("./llama/libllama.so", {
	llama_backend_init: {
		args: [FFIType.bool],
		returns: FFIType.void,
	},
});

lib.symbols.llama_backend_init(false);
