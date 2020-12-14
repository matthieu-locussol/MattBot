import * as d from 'discord.js';
import { canAnswer } from '../common';

const handleMessage = (message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      const play = message.client.emojis.cache.find((e) => e.name === 'play');
      const pause = message.client.emojis.cache.find((e) => e.name === 'pause');
      const stop = message.client.emojis.cache.find((e) => e.name === 'stop');
      const minus = message.client.emojis.cache.find((e) => e.name === 'minus');
      const plus = message.client.emojis.cache.find((e) => e.name === 'plus');
      const leave = message.client.emojis.cache.find((e) => e.name === 'leave');
      const playlist = message.client.emojis.cache.find((e) => e.name === 'playlist');
      const add = message.client.emojis.cache.find((e) => e.name === 'add');
      const clear = message.client.emojis.cache.find((e) => e.name === 'clear');

      message
         .react(play)
         .then(() =>
            message
               .react(pause)
               .then(() =>
                  message
                     .react(stop)
                     .then(() =>
                        message
                           .react(minus)
                           .then(() =>
                              message
                                 .react(plus)
                                 .then(() =>
                                    message
                                       .react(leave)
                                       .then(() =>
                                          message
                                             .react(playlist)
                                             .then(() => message.react(add).then(() => message.react(clear))),
                                       ),
                                 ),
                           ),
                     ),
               ),
         );
   }
};

export default handleMessage;
