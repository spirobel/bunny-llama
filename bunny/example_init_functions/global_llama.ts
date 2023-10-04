import {
    dlopen,
    FFIType,
    CString,
    ptr,
    JSCallback,
    Pointer,
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

    function promptLLama(p: string, prompt_callback?: PromptCallback, params?: string) {
        if (!prompt_callback) {
            prompt_callback = (response: string) => { process.stdout.write(response); return true }
        }
        const promptCallback = new JSCallback(
            (response: FFIType.cstring) => {
                const js_string = new CString(response);
                return prompt_callback!(js_string.toString());
            },
            {
                args: [FFIType.cstring],
                returns: "bool"
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
            promptCallback
        );
    }
    global.llama.prompt = promptLLama;

}

declare global {
    var llama: LLama;
}
export interface LLama {
    load_model: (
        params: string,

    ) => Promise<Model>;
    prompt: (p: string, prompt_callback?: PromptCallback, params?: string) => void;
    _model: Model;
}
export interface Model {
    llama_model: Pointer | null;
    params: string;
}

export type PromptCallback = (response: string) => boolean;
