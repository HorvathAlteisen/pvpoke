import type { PageServerLoad } from './$types';

/** community-day/22-05-geodude.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Alolan Geodude Community Day Guide for PvP",
			description: "The Alolan Geodude family is ready to rock! Which leagues and Pokemon should you be on the lookout for and how impactful will Rollout be on the meta?",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-04-stufful/og.jpg"
		}
	};
};
