import { program } from 'commander';
import { startOfWeek, format } from 'date-fns';
import { createWriteStream } from 'fs';
import inquirer from 'inquirer';
import opener from 'opener';

import { version } from '../package';
import { getLogger } from 'modules/logging';
import { getWeeklyTopPosts } from 'modules/reddit';

const log = getLogger('app');

const pickPost = async (post) => {
  log.info(`${post.title} by ${post.author} [${post.score}]`);
  const response = await inquirer.prompt([
    {
      type: 'expand',
      name: 'action',
      message: `Do you want to include this post?`,
      choices: [
        {
          key: 'o',
          name: 'Open in browser',
          value: 'open'
        },
        { key: 'a', name: 'Add', value: 'add' },
        { key: 's', name: 'Skip', value: 'skip' }
      ]
    }
  ]);

  switch (response.action) {
    case 'open':
      opener(post.url);
      return pickPost(post);
    case 'add': {
      const noteResponse = await inquirer.prompt([
        {
          type: 'input',
          name: 'notes',
          message: "Enter any notes you'd like to add to the post:"
        }
      ]);

      if (noteResponse.notes) {
        return {
          ...post,
          notes: noteResponse.notes
        };
      } else {
        return post;
      }
    }
    case 'skip':
    default:
      return null;
  }
};

const execute = async () => {
  const posts = await getWeeklyTopPosts();

  if (!Array.isArray(posts)) {
    return log.error('Did not get an array of posts from Reddit!');
  }

  const sorted = [...posts];
  const included = [];

  // sort by score descending
  sorted.sort((a, b) => b.score - a.score);

  for (const post of sorted.slice(0, 3)) {
    const result = await pickPost(post);

    if (result !== null) {
      included.push(result);
    }
  }

  let markdown = `Welcome to the DIY Digest for the week of ${format(
    startOfWeek(Date.now()),
    'MMMM'
  )}`;

  for (const post of included) {
    markdown += `\n* [${post.title.substr(
      0,
      Math.min(post.title.length, 50)
    )}](${post.url}) by ${post.author} {${post.score}}`;

    if (post.notes) {
      markdown += `\n${post.notes}`;
    }
  }

  const filename = `${format(Date.now(), 'yyyy-MM-dd')}.md`;

  log.info(`Creating ${filename}...`);
  const stream = createWriteStream(filename);

  await stream.write(markdown);
  stream.close();
};

program
  .version(version)
  .command('create')
  .description('Creates a new Markdown file for the current week')
  .action(execute);

program.parse(process.argv);
