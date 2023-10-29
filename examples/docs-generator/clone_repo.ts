import * as path from "path";
const REPO_LINK = "https://github.com/ggerganov/llama.cpp"

Bun.spawnSync({
    cwd: path.join(import.meta.dir),
    cmd: ["git", "clone", REPO_LINK],
    stdio: ["inherit", "inherit", "inherit"],
});

//bun examples/docs-generator/clone_repo.ts 