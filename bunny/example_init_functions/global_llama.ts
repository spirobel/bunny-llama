import {
    dlopen,
    FFIType,
    CString,
    ptr,
    JSCallback,
    suffix,
    Pointer,
} from "bun:ffi";

// example init function that adds api-llama.so to global context
// if you want to do this differently -> you can
export async function global_llama(path: string) {
    const lib = dlopen(path, {
        load_model: {
            args: [FFIType.cstring],
            returns: FFIType.ptr,
        },
        prompt: {
            args: [FFIType.cstring, FFIType.ptr, FFIType.cstring, FFIType.function],
        },
    });
    async function loadModel(params: string, prompt_callback?: PromptCallback) {
        const str = Buffer.from(`${params}\0`, "utf8");
        const llama_parts = lib.symbols.load_model(ptr(str));
        if (!prompt_callback) {
            prompt_callback = (response: string) => console.log(response);
        }

        global.llama._model = {
            llama_parts,
            params,
            prompt_callback,
        };

        function promptLLama(p: string, params?: string) {
            const promptCallback = new JSCallback(
                (response: FFIType.cstring) => {
                    const js_string = new CString(response);
                    prompt_callback!(js_string.toString());
                },
                {
                    args: [FFIType.cstring],
                },
            );
            if (!params) {
                params = global.llama._model.params;
            }
            const params_cstr = Buffer.from(`${params}\0`, "utf8");
            const prompt_cstr = Buffer.from(`${p}\0`, "utf8");

            lib.symbols.prompt(
                ptr(prompt_cstr),
                global.llama._model.llama_parts,
                ptr(params_cstr),
                promptCallback,
            );
        }

        global.llama.prompt = promptLLama;

        return { llama_parts, params, prompt_callback };
    }

    if (!global.llama) {
        global.llama = {} as LLama;
    }
    global.llama.load_model = loadModel;
}

declare global {
    var llama: LLama;
}
export interface LLama {
    load_model: (
        params: string,
        prompt_callback?: PromptCallback,
    ) => Promise<Model>;
    prompt: (p: string, params?: string) => void;
    _model: Model;
}
export interface Model {
    llama_parts: Pointer | null;
    params: string;
    prompt_callback: PromptCallback;
}

export type PromptCallback = (response: string) => void;
