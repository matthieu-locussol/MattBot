import Client from './core/Client';

new Client({
   aliases: {
      mp: 'music play',
      obm: 'osu beatmap',
      ob: 'osu best',
      or: 'osu recent',
   },
}).run();
