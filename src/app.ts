import Client from './core/Client';

new Client({
   aliases: {
      ob: 'osu best',
      or: 'osu recent',
   },
}).run();
