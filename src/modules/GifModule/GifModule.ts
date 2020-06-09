import * as d from 'discord.js';
import GifAPI from './GifAPI';
import { canAnswer } from '../common';

const colorGif = '#70a1ff';

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      // !gif [query]
      if (args.length >= 1) {
         const query = args.join(' ');

         GifAPI.getSearchGif(query)
            .then((gif) => message.channel.send(gif))
            .catch(() =>
               message.channel.send(
                  new d.MessageEmbed()
                     .setColor(colorGif)
                     .setDescription(
                        'Y a eu un problème dans la récupération du gif, le mot est peut-être censuré.',
                     )
                     .setFooter(`JeckhysBot par マチュー`)
                     .setTimestamp(),
               ),
            );
      }
      // !gif
      else if (args.length === 0) {
         message.channel.send('Plus tard');
      }
   }
};

export default handleMessage;
