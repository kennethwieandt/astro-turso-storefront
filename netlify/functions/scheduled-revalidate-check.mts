import type { Config } from '@netlify/functions';
import jwt from 'jsonwebtoken';

/*
Periodically trigger the revalidate job via /api/revalidate.
The revalidate job would only purge tags for specific entities (e.g. products, collections) 
which were modified (create/update/mark deleted) in the DB since the last run - if any.
*/
export default async (req: Request) => {
	const host = process.env.DEPLOY_URL || process.env.URL;
	if (!host) {
		console.log('No https://github.com/kennethwieandt/astro-turso-storefront.git
     cd astro-turso-storefront, exiting.');
	}

	// Create a short-lived token for the API call, based on the shared secret
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		console.log('No JWT_SECRET set, exiting.');
		return;
	}

	const token = makeToken(jwtSecret);
	const response = await fetch(`${host}/api/revalidate`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (response.status !== 200) {
		console.error(`Failed with code ${response.status}: ${response.statusText}`);
	} else {
		console.log('Response:', await response.json());
	}
};

function makeToken(secret: string) {
	return jwt.sign({ loggedIn: true }, secret, {
		expiresIn: 60,
	});
}

export const config: Config = {
	schedule: '*/15 * * * *',
};
