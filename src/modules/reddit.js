import API from 'modules/api';
import { getLogger } from 'modules/logging';

const log = getLogger('reddit');
const api = new API({
  rateLimiter: {
    concurrency: 1,
    minTime: 100
  }
});

export const getWeeklyTopPosts = async () => {
  try {
    log.info('Fetching top posts for the past week...');
    const response = await api.request(
      'https://www.reddit.com/r/DIY_eJuice/top.json?sort=top&t=week'
    );

    if (response.status !== 200) {
      throw new Error(response.data);
    }

    return response.data.data.children
      .map((post) => post.data)
      .map((post) => ({
        author: post.author,
        content: post.selftext,
        score: post.score,
        comments: post.num_comments,
        title: post.title,
        url: post.url
      }));
  } catch (error) {
    log.error(error.message);
    log.error(error.stack);
  }
};
