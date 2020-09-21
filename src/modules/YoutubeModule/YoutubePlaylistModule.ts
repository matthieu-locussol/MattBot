import axios from 'axios';
import * as d from 'discord.js';
import Config from '../../config/Config';
import { canAnswer, getYoutubePlaylistId } from '../common';

const instance = axios.create({
   baseURL: Config.api.endpoint.youtube,
});

const parsePlaylistVideos = (data: any) =>
   data.items.map((item: any) => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      link: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
   }));

export const playlistEmbed = (infos: any, link: string, data: any) => {
   let nextPage = data.nextPageToken ? data.nextPageToken : '';
   let previousPage = data.prevPageToken ? data.prevPageToken : '';
   let videos = parsePlaylistVideos(data);

   const attachment = new d.MessageAttachment('src/assets/music/youtube.png', 'youtube.png');

   return new d.MessageEmbed({
      title: infos.title,
      url: link,
      description: `${previousPage}:${nextPage}`,
      fields: videos.map((video: any, index: number) => ({
         name: `${index + 1} - ${video.title}`,
         value: `[Ouvrir dans YouTube](${video.link})`,
      })),
      footer: { text: 'Utilise les boutons pour changer la musique' },
   })
      .attachFiles([attachment])
      .setThumbnail('attachment://youtube.png')
      .setImage(infos.picture);
};

export const getPlaylistData = async (id: string, page?: string) => {
   const pageToken = page ? { pageToken: page } : {};
   const response = await instance.get(Config.api.endpoint.youtube, {
      params: {
         part: 'snippet',
         playlistId: id,
         key: Config.api.key.youtube,
         ...pageToken,
      },
   });

   return response.data;
};

export const getYoutubePlaylistInfos = async (id: string) => {
   const response = await instance.get(Config.api.endpoint.youtubePlaylistName, {
      params: {
         part: 'snippet',
         id,
         key: Config.api.key.youtube,
      },
   });

   return {
      title: response.data.items[0].snippet.title,
      picture: response.data.items[0].snippet.thumbnails.maxres.url,
   };
};

export const getLinkFromField = (field: d.EmbedField) => field.value.split('(')[1].split(')')[0];

const handleMessage = (message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels) && !message.author.bot) {
      const link = message.content;
      const id = getYoutubePlaylistId(link);

      const play = message.client.emojis.cache.find((e) => e.name === 'play');
      const pause = message.client.emojis.cache.find((e) => e.name === 'pause');
      const stop = message.client.emojis.cache.find((e) => e.name === 'stop');
      const minus = message.client.emojis.cache.find((e) => e.name === 'minus');
      const plus = message.client.emojis.cache.find((e) => e.name === 'plus');
      const leave = message.client.emojis.cache.find((e) => e.name === 'leave');

      getPlaylistData(id)
         .then((data) => {
            getYoutubePlaylistInfos(id)
               .then((infos) => {
                  message.delete();
                  message.channel
                     .send(playlistEmbed(infos, link, data))
                     .then((message) =>
                        message
                           .react('⬅️')
                           .then(() =>
                              message
                                 .react('1️⃣')
                                 .then(() =>
                                    message
                                       .react('2️⃣')
                                       .then(() =>
                                          message
                                             .react('3️⃣')
                                             .then(() =>
                                                message
                                                   .react('4️⃣')
                                                   .then(() =>
                                                      message
                                                         .react('5️⃣')
                                                         .then(() =>
                                                            message
                                                               .react('➡️')
                                                               .then(() =>
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
                                                                                                message.react(
                                                                                                   leave,
                                                                                                ),
                                                                                             ),
                                                                                       ),
                                                                                 ),
                                                                           ),
                                                                     ),
                                                               ),
                                                         ),
                                                   ),
                                             ),
                                       ),
                                 ),
                           ),
                     );
               })
               .catch((error) => console.error(error));
         })
         .catch((error) => console.error(error));
   }
};

export default handleMessage;
