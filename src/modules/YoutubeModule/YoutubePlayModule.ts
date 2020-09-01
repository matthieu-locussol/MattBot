import * as d from 'discord.js';
import { canAnswer } from '../common';
import MusicManager from '../../core/MusicManager';
import { isYoutube } from '../common';
import { playMusic, upVolume, downVolume } from '../MusicModule/MusicModule';

const removeReaction = (message: d.Message, user: d.User | d.PartialUser) => {
   message.reactions.cache.forEach((r) => r.users.remove(user.id));
};

export const handleMessageReaction = (
   { message, emoji }: d.MessageReaction,
   user: d.User | d.PartialUser,
   musicManager: MusicManager,
   channels: string[] = [],
) => {
   if (canAnswer(message, channels)) {
      if (!user.bot) {
         if (isYoutube(message.content)) {
            if (emoji.name === 'play') {
               if (musicManager.isPaused()) {
                  musicManager.resume();
               } else {
                  playMusic(message.content, message, musicManager);
               }
            } else if (emoji.name === 'pause') {
               musicManager.pause();
            } else if (emoji.name === 'stop') {
               musicManager.stop();
            } else if (emoji.name === 'minus') {
               downVolume(message.channel, musicManager);
            } else if (emoji.name === 'plus') {
               upVolume(message.channel, musicManager);
            } else if (emoji.name === 'leave') {
               musicManager.leave();
            }

            removeReaction(message, user);
         }
      }
   }
};

export default handleMessageReaction;
