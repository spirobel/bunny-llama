import {
	dlopen,
	FFIType,
	CString,
	ptr,
	JSCallback,
	Pointer,
	read,
} from "bun:ffi";

// example init function that adds api-llama.so to global context
// if you want to do this differently -> you can
export function global_llama(path: string) {
	const lib = dlopen(path, {
		load_model: {
			args: [FFIType.cstring],
			returns: FFIType.ptr,
		},
		prompt: {
			args: [FFIType.cstring, FFIType.ptr, FFIType.cstring, FFIType.function],
		},
	});
	async function loadModel(params: string) {
		const str = Buffer.from(`${params}\0`, "utf8");
		const llama_model = lib.symbols.load_model(ptr(str));

		global.llama._model = {
			llama_model,
			params,
		};

		return { llama_model, params };
	}

	if (!global.llama) {
		global.llama = {} as LLama;
	}
	global.llama.load_model = loadModel;

	function promptLLama(
		p: string,
		prompt_callback?: PromptCallback,
		params?: string,
	) {
		if (!prompt_callback) {
			prompt_callback = (response: string) => {
				process.stdout.write(response);
				return true;
			};
		}
		const multibyteChar: number[] = [];

		const promptCallback = new JSCallback(
			(response: FFIType.cstring, l: FFIType.u64) => {
				const numbers: number[] = [];
				for (let i = 0; i < l; i++) {
					const n = read.u8(response, i);
					if (is_first_byte(n)) {
						multibyteChar.length = 0; //new mbc
						multibyteChar.push(n);
					} else if (is_following_byte(n)) {
						multibyteChar.push(n);
						if (mbc_length(multibyteChar[0]) <= multibyteChar.length) {
							numbers.push(...multibyteChar);
							multibyteChar.length = 0; //new mbc
						}
					} else {
						numbers.push(n);
					}
				}
				return prompt_callback!(
					new TextDecoder().decode(new Uint8Array(numbers)),
				);
			},
			{
				args: [FFIType.cstring, FFIType.u64],
				returns: "bool",
			},
		);
		if (!params) {
			params = global.llama._model.params;
		}
		const params_cstr = Buffer.from(`${params}\0`, "utf8");
		const prompt_cstr = Buffer.from(`${p}\0`, "utf8");
		lib.symbols.prompt(
			ptr(prompt_cstr),
			global.llama._model.llama_model,
			ptr(params_cstr),
			promptCallback,
		);
	}
	global.llama.prompt = promptLLama;
}

declare global {
	var llama: LLama;
}
export interface LLama {
	load_model: (params: string) => Promise<Model>;
	prompt: (
		p: string,
		prompt_callback?: PromptCallback,
		params?: string,
	) => void;
	_model: Model;
}
export interface Model {
	llama_model: Pointer | null;
	params: string;
}

export type PromptCallback = (response: string) => boolean;

//helper to make sure we have a full unicode character:

/*
            FIRST u8  HEX  DEZ FOLLOWING u8  HEX DEZ
Single byte 0XXXXXXX 	   DEZ N/A 	
Two bytes 	110XXXXX   C0  192 10XXXXXX 	 80  128
Three bytes 1110XXXX   E0  224 10XXXXXX      80  128
Four bytes 	11110XXX   F0  240 10XXXXXX      80  128
            11110111   F7  247 10111111      BF  191
*/
function is_first_byte(n: number) {
	return n >= 192;
}
function is_following_byte(n: number) {
	return n >= 128 && n <= 191;
}
function mbc_length(first_byte: number = 0) {
	if (first_byte >= 240) {
		return 4;
	} else if (first_byte >= 224) {
		return 3;
	} else if (first_byte >= 192) {
		return 2;
	} else {
		return 1;
	}
}
