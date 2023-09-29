import * as path from "path";
const ENV = process.env;

Bun.spawnSync({
	cwd: path.join(import.meta.dir, ".."),
	cmd: ["git", "clone", ENV.LLAMA_REPO_LINK!],
	stdio: ["inherit", "inherit", "inherit"],
});

Bun.spawnSync({
	cwd: path.join(import.meta.dir, "../llama.cpp"),
	cmd: ["git", "reset", "--hard", String(ENV.LLAMA_COMMIT_HASH!)],
	stdio: ["inherit", "inherit", "inherit"],
});
