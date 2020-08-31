import * as d from 'discord.js';
import { canAnswer } from '../common';
import MusicManager from '../../core/MusicManager';
import { isYoutube } from '../common';
import { playMusic } from '../MusicModule/MusicModule';

export const handleMessageReaction = (
   { message, emoji }: d.MessageReaction,
   user: d.User | d.PartialUser,
   musicManager: MusicManager,
   channels: string[] = [],
) => {
   if (canAnswer(message, channels)) {
      if (!user.bot) {
         if (emoji.name === 'play') {
            if (isYoutube(message.content)) {
               playMusic(message.content, message, musicManager);
            }
         }
      }
   }
};

export default handleMessageReaction;
