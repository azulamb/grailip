export default {
	fetch(request: Request): Response {
		return new Response(`${request.method}: Hello, world!`);
	},
};
