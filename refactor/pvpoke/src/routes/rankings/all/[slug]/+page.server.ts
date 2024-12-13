import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const allowedSlugs = ['1500', '2500', '10000'] as const; 
    // `as const` makes `allowedSlugs` a readonly tuple, which can help with type narrowing if needed.
    const { slug } = params;

    // Validate the slug
    if (!allowedSlugs.includes(slug)) {
        // Option 1: Throw a 404 error
        // throw error(404, 'Not found');

        // Option 2: Redirect to a custom error page
        throw redirect(303, '/error');
    }

    // Return data if slug is valid
    return {
        slug
    };
};
