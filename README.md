# bunny-llama

## What is this?

A bunny that sits on top of a llama (and controls it).


## To run:

```bash
bun clone
bun make
bun ride.ts
```

### To clean:

``` bash
bun clean-llama
bun clean-bunny
```

### To install dependencies:

```bash
bun install
```

(most likely you already have git and zig)

Install zig with the right version:

``` bash
bun install -g @oven/zig
```
or update it as described [here](https://bun.sh/docs/project/development#install-zig)

## Nvidia llama

For people with nvidia gpus:

install [conda.](https://docs.conda.io/projects/conda/en/latest/user-guide/install/linux.html)
``` bash
conda create -n bunny
conda activate bunny
conda install cuda -c nvidia
```


then make the llama and the bunny separately, like so:

```bash
bun clone
bun make-cuda-llama
bun make-bunny
bun ride.ts
```

now you have a special cuda enabled llama.

if you closed your shell and you want build the cuda llama again,
you need to activate the conda environment first:
``` bash
conda activate bunny
bun make-cuda-llama
```