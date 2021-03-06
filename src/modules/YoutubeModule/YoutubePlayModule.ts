import * as d from 'discord.js';
import { canAnswer, isYoutubePlaylist, isYoutube, getNumberFromEmoji, getYoutubePlaylistId } from '../common';
import MusicManager from '../../core/MusicManager';
import { playMusic, playMusicForce, upVolume, downVolume } from '../MusicModule/MusicModule';
import {
   playlistEmbed,
   getLinkFromField,
   getPlaylistData,
   getYoutubePlaylistInfos,
   getAllPlaylistData,
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
         removeReaction(message, user);

         // Reacts to a Youtube video
         if (isYoutube(message.content)) {
            if (emoji.name === 'play') {
               if (musicManager.isPaused()) {
                  musicManager.resume();
               } else {
                  playMusic(
                     message.content,
                     message,
                     musicManager,
                     message.guild.member(user.id).voice.channel,
                  );
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
            } else if (emoji.name === 'playlist') {
               musicManager.playPlaylist(message.guild.member(user.id).voice.channel);
            } else if (emoji.name === 'add') {
               const status = musicManager.addSongPlaylist(message.content);
               message.channel.send(status);
            } else if (emoji.name === 'clear') {
               musicManager.clearPlaylist();
            }
         }
         // Reacts to a Youtube playlist
         else if (isYoutubePlaylist(message.embeds[0].url)) {
            const embed = message.embeds[0];
            const tokens = embed.description.split(':');

            if (emoji.name === '⬅️') {
               const id = getYoutubePlaylistId(embed.url);

               getPlaylistData(id, tokens[0]).then((data) =>
                  getYoutubePlaylistInfos(id).then((infos) =>
                     message.edit(playlistEmbed(infos, embed.url, data)),
                  ),
               );
            } else if (emoji.name === '➡️') {
               const id = getYoutubePlaylistId(embed.url);

               getPlaylistData(id, tokens[1]).then((data) =>
                  getYoutubePlaylistInfos(id).then((infos) =>
                     message.edit(playlistEmbed(infos, embed.url, data)),
                  ),
               );
            } else if (emoji.name === 'playlist') {
               const id = getYoutubePlaylistId(embed.url);
               getAllPlaylistData(id).then((playlistLinks) =>
                  musicManager.setPlaylist(playlistLinks, message.guild.member(user.id).voice.channel),
               );
            } else if (emoji.name === 'skip') {
               musicManager.skip();
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
      }
   }
};

export default handleMessageReaction;
