import { connect } from '@planetscale/database';

async function handleRequest(request, env) {
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
		const url = new URL(request.url);
		const userEmail = url.searchParams.get('userEmail');

		if (!userEmail) {
			return new Response('userEmail is required', {
				headers: {
					'content-type': 'text/plain',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
				status: 400, // Bad Request
			});
		}

		// Fetch user data from the database based on userId
		const userData = await conn.execute('SELECT * FROM reviewAppUsers WHERE UserEmail = ?', [userEmail]);

		if (userData.error || userData.rows.length === 0) {
			return new Response('User not found', {
				headers: {
					'content-type': 'text/plain',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
				status: 404, // Not Found
			});
		}

		const user = userData.rows[0];
		return new Response(JSON.stringify(user), {
			headers: {
				'content-type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
			status: 200,
		});
	} catch (error) {
		return new Response(error + '\n' + request, {
			headers: {
				'content-type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
			status: 111, // Internal Server Error
		});
	}
}

async function handlePostRequest(request, conn) {
	try {
		const url = new URL(request.url);
		const userEmail = url.searchParams.get('userEmail');
		const userName = url.searchParams.get('userName');

		const currentDate = new Date();

		const insertResult = await conn.execute('INSERT INTO reviewAppUsers (UserName, UserEmail, RegistrationDate) VALUES (?, ?, ?);', [
			userName,
			userEmail,
			currentDate,
		]);

		if (insertResult.error) {
			return new Response('Error inserting data into the database', {
				headers: {
					'content-type': 'text/plain',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
				status: 500, // Internal Server Error
			});
		}

		return new Response('User data inserted successfully', {
			headers: {
				'content-type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
			status: 201, // Created
		});
	} catch (error) {
		return new Response(error + '\n' + request, {
			headers: {
				'content-type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			},
			status: 500, // Internal Server Error
		});
	}
}

export default handleRequest;
