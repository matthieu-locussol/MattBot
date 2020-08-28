import Client from './core/Client';

new Client({
   aliases: {
      mpf: 'music play force',
      mp: 'music play',
      mv: 'music volume',
      obm: 'osu beatmap',
      ob: 'osu best',
      or: 'osu recent',
   },
}).run();
