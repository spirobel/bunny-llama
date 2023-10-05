console.log("Hello via Bun!");
Bun.serve({
	fetch(req: Request) {
		console.log(req);
		return new Response("Bun!");
	},
	port: 3000,
});
console.log("test");
