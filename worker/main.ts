interface R2Bucket {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
}

interface Env {
	API_TOKEN: string;
	storage: R2Bucket;
};

async function get(request: Request, env: Env, key: string): Promise<Response> {
	const object = await env.storage.get(key);
	return new Response(`${request.method}: Hello, world!`);
}

async function post(request: Request, env: Env, key: string): Promise<Response> {
	return new Response(`${request.method}: Hello, world!`);
}

async function del(request: Request, env: Env, key: string): Promise<Response> {
	return new Response(`${request.method}: Hello, world!`);
}

const pattern = new URLPattern({pathname: '/:key'});

export default {
	fetch(request: Request, env: Env): Promise<Response> | Response {
		const token = request.headers.get('Authorization');
		if (token !== `Bearer ${env.API_TOKEN}`) {
			return new Response('Unauthorized', { status: 401 });
		}

		const params = pattern.exec(request.url)?.pathname?.groups || {};
		if (!params.key) {
			return new Response('Bad Request', { status: 400 });
		}
		const key = params.key;

		switch (request.method) {
			case 'GET':
				return get(request, env, key);
			case 'POST':
				return post(request, env, key);
			case 'DELETE':
				return del(request, env, key);
		}
		return new Response('Method Not Allowed', { status: 405 });
	},
};
