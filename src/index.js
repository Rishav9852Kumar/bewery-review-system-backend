import { Router } from 'itty-router';
import handleRequest from './account/user.js';
import handleReviewRequest from './reviews/reviews.js';
// Router
const router = Router();

// User Routes
router.get('/user', (request, env) => handleRequest(request,env));
router.post('/user', (request, env) => handleRequest(request, env));

// Reviews
router.get('/reviews', (request, env) => handleReviewRequest(request, env));
router.post('/reviews', (request, env) => handleReviewRequest(request, env));

export default {
	async fetch(request, env, ctx) {
		const result = await router.handle(request, env, ctx);

		if (!result) {
			return new Response('Invalid URL', { status: 404 });
		}

		return result;
	},
};