import { connect } from '@planetscale/database';

async function handleReviewRequest(request, env) {
	const config = {
		host: env.DATABASE_HOST,
		username: env.DATABASE_USERNAME,
		password: env.DATABASE_PASSWORD,
		fetch: (url, init) => {
			delete init['cache'];
			return fetch(url, init);
		},
	};
	const conn = connect(config);

	switch (request.method) {
		case 'GET':
			return handleGetRequest(request, conn);
		case 'POST':
			return handlePostRequest(request, conn);
		default:
			return new Response('Invalid request method', {
				headers: {
					'content-type': 'text/plain',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
				status: 400, // Bad Request
			});
	}
}

async function handleGetRequest(request, conn) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get('userEmail');
		const breweryId = searchParams.get('breweryId');

		if (!email && !breweryId) {
			return new Response('Email or BreweryId is required', { status: 400 });
		}

		let query;
		let queryParams;

		if (email) {
			query = 'SELECT * FROM BreweryReviews WHERE Email = ?';
			queryParams = [email];
		} else if (breweryId) {
			query = 'SELECT * FROM BreweryReviews WHERE BreweryId = ?';
			queryParams = [breweryId];
		}

		const result = await conn.execute(query, queryParams);
		const reviews = result.rows;

		return new Response(JSON.stringify(reviews), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		});
	} catch (error) {
		return new Response(error.message, { status: 500 });
	}
}

async function handlePostRequest(request, conn) {
	try {
		 const { searchParams } = new URL(request.url);

			const stars = parseInt(searchParams.get('stars'));
			const reviewComment = searchParams.get('reviewComment');
			const email = searchParams.get('email');
			const breweryId = searchParams.get('breweryId');
			const breweryName = searchParams.get('breweryName');

		if (!stars || !reviewComment || !email || !breweryId || !breweryName) {
			return new Response('Stars, Review Comment, Email, BreweryId, and BreweryName are required', {
				status: 400,
			});
		}

		const insertResult = await conn.execute(
			'INSERT INTO BreweryReviews (BreweryId, BreweryName, Stars, Email, ReviewComment) VALUES (?, ?, ?, ?, ?)',
			[breweryId, breweryName, stars, email, reviewComment]
		);

		if (insertResult.error) {
			return new Response(insertResult.error, { status: 500 });
		}

		return new Response('Review added successfully', {
			status: 200,
			headers: {
				'content-type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
		});
	} catch (error) {
		return new Response(error.message, { status: 500 });
	}
}

export default handleReviewRequest;
