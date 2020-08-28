import * as d from 'discord.js';
import * as ytdl from 'ytdl-core';
import { canAnswer } from '../common';

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      if (message.channel.type !== 'dm') {
         const voiceChannel = message.member.voice.channel;

         if (!voiceChannel) {
            return message.reply("Rejoins un channel d'abord, connard.");
         }

         voiceChannel.join().then((connection) => {
            const stream = ytdl('https://www.youtube.com/watch?v=5qap5aO4i9A', { filter: 'audioonly' });
            const dispatcher = connection.play(stream);

            dispatcher.on('finish', () => voiceChannel.leave());
         });

         message.channel.send('PLAY MUSIC');
      }
   }
};

export default handleMessage;
