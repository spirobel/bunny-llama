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

For people with nvidia gpus:

Download and install the [cuda toolkit.](https://developer.nvidia.com/cuda-downloads)

then make the llama and the bunny separately, like so:

```bash
bun clone
bun make-cuda-llama
bun make-bunny
bun ride.ts
```

now you have a special cuda enabled llama.