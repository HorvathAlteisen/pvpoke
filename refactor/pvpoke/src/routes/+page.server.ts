// src/routes/rankings/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = () => {

    const CANONICAL: string = '';
    const META_TITLE: string = '';
    const META_DESCRIPTION: string = '';

    return {
        CANONICAL,
        META_TITLE,
        META_DESCRIPTION
    };

}