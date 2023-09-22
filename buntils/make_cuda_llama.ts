import * as path from "path";

const CONDA_PREFIX = process.env.CONDA_PREFIX
const CPPFLAGS = `-L${CONDA_PREFIX}/lib -I${CONDA_PREFIX}/include/`
const MK_LDFLAGS = `-lcublas_static -lculibos -lcudart_static -lcublasLt_static -lpthread -ldl -lrt -L/usr/local/cuda/lib64 -L/opt/cuda/lib64 -L/targets/x86_64-linux/lib -L${CONDA_PREFIX}/lib`
const LLAMA_CUBLAS = "1"
Bun.spawnSync(["make"], {
    cwd: path.join(import.meta.dir, "../llama"), 
    env: { ...process.env, CPPFLAGS, MK_LDFLAGS, LLAMA_CUBLAS },
    stdio: ["inherit", "inherit","inherit"]
  });  