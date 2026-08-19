import type { PageServerLoad } from './$types';

/** articles/community-day/23-08-froakie.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Froakie Community Day Guide for PvP',
			description:
				"Fan favorite Greninja is finally getting the level-up it needs! Will it be enough to become viable in PvP? Find out more about Greninja and IV's to look for during the upcoming Community Day!",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/23-08-froakie/og.jpg'
		}
	};
};
