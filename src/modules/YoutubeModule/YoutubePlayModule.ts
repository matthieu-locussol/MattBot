import * as d from 'discord.js';
import { canAnswer, isYoutubePlaylist, isYoutube, getNumberFromEmoji, getYoutubePlaylistId } from '../common';
import MusicManager from '../../core/MusicManager';
import { playMusic, playMusicForce, upVolume, downVolume } from '../MusicModule/MusicModule';
import {
   playlistEmbed,
   getLinkFromField,
   getPlaylistData,
   getYoutubePlaylistTitle,
} from '../YoutubeModule/YoutubePlaylistModule';

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
         // Reacts to a Youtube video
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
         }
         // Reacts to a Youtube playlist
         else if (isYoutubePlaylist(message.embeds[0].url)) {
            const embed = message.embeds[0];
            const tokens = embed.description.split(':');

            if (emoji.name === '⬅️') {
               const id = getYoutubePlaylistId(embed.url);

               getPlaylistData(id, tokens[0]).then((data) =>
                  getYoutubePlaylistTitle(id).then((title) =>
                     message.edit(playlistEmbed(title, embed.url, data)),
                  ),
               );
            } else if (emoji.name === '➡️') {
               const id = getYoutubePlaylistId(embed.url);

               getPlaylistData(id, tokens[1]).then((data) =>
                  getYoutubePlaylistTitle(id).then((title) =>
                     message.edit(playlistEmbed(title, embed.url, data)),
                  ),
               );
            } else if (emoji.name === 'play') {
               if (musicManager.isPaused()) {
                  musicManager.resume();
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
            } else {
               const musicNumber = getNumberFromEmoji(emoji.name);
               const member = message.guild.member(user.id);
               const link = getLinkFromField(embed.fields[musicNumber - 1]);

               playMusicForce(link, { content: link, author: user, member } as d.Message, musicManager);
            }
         }

         removeReaction(message, user);
      }
   }
};

export default handleMessageReaction;
