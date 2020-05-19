import Client from './core/Client';

new Client({
   aliases: {
      '!or': '!osu recent',
   },
}).run();
