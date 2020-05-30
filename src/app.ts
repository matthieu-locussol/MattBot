import Client from './core/Client';

new Client({
   aliases: {
      obm: 'osu beatmap',
      ob: 'osu best',
      or: 'osu recent',
   },
}).run();
