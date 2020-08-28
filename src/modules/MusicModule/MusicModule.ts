import * as d from 'discord.js';
import * as ytdl from 'ytdl-core';
import { canAnswer, isNotDM } from '../common';
import * as musicSettings from '../../data/music.json';

const YOUTUBE_REGEX = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

const isYoutube = (link: string) => YOUTUBE_REGEX.test(link);
// const linkYoutube = (link: string) => `https://www.youtube.com/watch?v=${YOUTUBE_REGEX.exec(link)[1]}`;

const updateVolume = (message: d.Message, dispatcher: d.StreamDispatcher, volume: number) => {
   if (volume >= 0 && volume <= 10) {
      dispatcher.setVolumeLogarithmic(volume / 10);
      message.reply(`Volume mis à jour sur : ${volume}/10.`);
   } else {
      message.reply('Le volume doit être compris entre 0 et 10.');
   }
};

const playMusic = (
   url: string,
   message: d.Message,
   dispatcher: d.StreamDispatcher,
   setDispatcher: (dispatcher: d.StreamDispatcher) => any,
) => {
   const prefix = message.content[0];
   const voiceChannel = message.member.voice.channel;

   if (voiceChannel) {
      if (!dispatcher) {
         voiceChannel.join().then((connection) => {
            const stream = ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 });
            dispatcher = connection.play(stream);

            initDispatcher(dispatcher, setDispatcher);
         });
      } else {
         message.reply(
            `Une musique est déjà en cours, utilise \`${prefix}music play force\` pour forcer le changement.`,
         );
      }
   } else {
      message.reply("Rejoins d'abord un canal vocal, connard.");
   }
};

const playMusicForce = (
   url: string,
   message: d.Message,
   dispatcher: d.StreamDispatcher,
   setDispatcher: (dispatcher: d.StreamDispatcher) => any,
) => {
   if (dispatcher) {
      dispatcher.end();
   }

   playMusic(url, message, null, setDispatcher);
};

const initDispatcher = (
   dispatcher: d.StreamDispatcher,
   setDispatcher: (dispatcher: d.StreamDispatcher) => any,
) => {
   dispatcher.setVolumeLogarithmic(musicSettings.defaultVolume / 10);
   dispatcher.on('finish', () => setDispatcher(null));

   setDispatcher(dispatcher);
};

const handleMessage = (
   args: string[],
   message: d.Message,
   dispatcher: d.StreamDispatcher,
   setDispatcher: (dispatcher: d.StreamDispatcher) => any,
   channels: string[] = [],
) => {
   if (canAnswer(message, channels) && isNotDM(message)) {
      // !music volume <number>
      if (args.length === 2 && args[0] === 'volume') {
         const volume = parseInt(args[1]);
         updateVolume(message, dispatcher, volume);
      }
      // !music play <link>
      else if (args.length === 2 && args[0] === 'play') {
         const url = args[1];

         if (isYoutube(url)) {
            playMusic(url, message, dispatcher, setDispatcher);
         }
      }
      // !music play force <link>
      else if (args.length === 3 && args[0] === 'play' && args[1] === 'force') {
         const url = args[2];

         if (isYoutube(url)) {
            playMusicForce(url, message, dispatcher, setDispatcher);
         }
      }
   }
};

export default handleMessage;
