import {
    dlopen,
    FFIType,
    CString,
    ptr,
    JSCallback,
    Pointer,
    read
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
            (response: FFIType.cstring, l: FFIType.u64) => {
                const js_string = new CString(response, 0, l);
                console.log(js_string)
                let numbers = []
                for (let i = 0; i < l; i++) {
                    const n = read.u8(response, i)
                    numbers.push(n)
                    /*
                    FIRST u8  HEX  DEZ FOLLOWING u8  HEX DEZ
        Single byte 0XXXXXXX 	   DEZ N/A 	
        Two bytes 	110XXXXX   C0  192 10XXXXXX 	 80  128
        Three bytes 1110XXXX   E0  224 10XXXXXX      80  128
        Four bytes 	11110XXX   F0  240 10XXXXXX      80  128
                    */
                    console.log(n)
                    console.log(n.toString(16))
                }
                return prompt_callback!(new TextDecoder().decode(new Uint8Array(numbers)));


            },
            {
                args: [FFIType.cstring, FFIType.u64],
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

//helper to make sure we have a full unicode character:
function isCompleteUnicode(buffer: ArrayBuffer) {
    try {
        const decoder = new TextDecoder();
        decoder.decode(buffer);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}
function arrayBufferToString(buffer: ArrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    const string = decoder.decode(buffer);
    return string;
}
function concatArrayBuffers(buffers: ArrayBuffer[]) {
    // Calculate the total size of the new ArrayBuffer
    const totalSize = buffers.reduce((total, buffer) => total + buffer.byteLength, 0);

    // Create the new ArrayBuffer and a typed array that views it
    const resultBuffer = new ArrayBuffer(totalSize);
    const resultView = new Uint8Array(resultBuffer);

    // Copy the data from the input ArrayBuffers to the new ArrayBuffer
    let offset = 0;
    for (const buffer of buffers) {
        const view = new Uint8Array(buffer);
        resultView.set(view, offset);
        offset += buffer.byteLength;
    }

    return resultBuffer;
}
