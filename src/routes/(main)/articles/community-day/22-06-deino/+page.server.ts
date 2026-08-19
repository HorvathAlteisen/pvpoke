import type { PageServerLoad } from './$types';

/** community-day/22-06-deino.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: "Deino Community Day Guide for PvP",
			description: "Are three heads better than one? Find out how Brutal Swing Hydreigon will impact the meta and which PvP Pokemon and IV's to look for this Community Day!",
			ogImage: "https://pvpoke.com/articles/article-assets/community-day/22-06-deino/og.jpg"
		}
	};
};
