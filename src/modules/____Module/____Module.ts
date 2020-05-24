import * as d from 'discord.js';
import { canAnswer } from '../common';

const handleMessageReaction = (
   { message, emoji }: d.MessageReaction,
   user: d.User | d.PartialUser,
   channels: string[] = [],
) => {
   if (canAnswer(message, channels)) {
      if (!user.bot) {
         if (emoji.name === 'gnome') {
            Promise.all([
               message.react('🇵'),
               message.react('🇺'),
               message.react('🇹'),
               message.react('🇪'),
               message.react('❗'),
            ]);
         }
      }
   }
};

export default handleMessageReaction;
