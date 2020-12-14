import * as d from 'discord.js';
import * as ytdl from 'ytdl-core';
import * as musicSettings from '../data/music.json';

export default class MusicManager {
   private play: boolean;
   private volume: number;
   private channels: string[];
   private connection: d.VoiceConnection;
   private dispatcher: d.StreamDispatcher;

   private skipped: boolean;
   private queue: string[];
   private queueCurrent: number | null;

   constructor() {
      this.play = false;
      this.volume = musicSettings.defaultVolume;
      this.channels = ['playlists', 'dev-bot'];
      this.connection = null;
      this.dispatcher = null;

      this.skipped = false;
      this.queue = [];
      this.queueCurrent = null;
   }

   public join = async (voiceChannel: d.VoiceChannel) => {
      const connection = await voiceChannel.join();
      this.connection = connection;
   };
   public leave = () => {
      this.queue = [];
      this.connection.disconnect();
      this.stop();
   };
   public isInVocal = () => {
      return this.connection !== null;
   };
   public isPaused = () => {
      return !this.play && this.dispatcher !== null;
   };
   public isPlaying = () => {
      return this.play;
   };

   public initDispatcher = () => {
      this.setVolume(musicSettings.defaultVolume); // this.volume || ...
      this.dispatcher.on('finish', () => {
         this.play = false;
         this.setDispatcher(null);

         if (this.skipped) {
            this.skipped = false;
         } else {
            if (this.queue.length !== 0) {
               this.playPlaylist();
            }
         }
      });
   };
   public getDispatcher = () => {
      return this.dispatcher;
   };
   public setDispatcher = (dispatcher: d.StreamDispatcher) => {
      this.dispatcher = dispatcher;
   };

   public stop = (erasePlaylist = true) => {
      if (erasePlaylist) {
         this.clearPlaylist();
      }

      if (this.dispatcher) {
         this.dispatcher.end();
         this.dispatcher = null;
      }

      this.play = false;
   };
   public pause = () => {
      if (this.play) {
         this.play = false;
         this.dispatcher.pause();
      }
   };
   public resume = () => {
      if (!this.play) {
         this.play = true;
         this.dispatcher.resume();
      }
   };
   public getVolume = () => {
      return this.volume;
   };
   public setVolume = (volume: number) => {
      this.volume = volume;
      this.dispatcher.setVolumeLogarithmic(volume / musicSettings.maxVolume);
   };

   public playYoutube = (link: string, erasePlaylist = true) => {
      if (erasePlaylist) {
         this.clearPlaylist();
      }

      const options: ytdl.downloadOptions = {
         highWaterMark: 1 << 25,
         quality: 'highestaudio',
      };
      const stream = ytdl(link, options);
      this.dispatcher = this.connection.play(stream);
      this.play = true;

      this.initDispatcher();
   };
   public setPlaylist = (links: string[], voiceChannel: d.VoiceChannel) => {
      this.join(voiceChannel).then(() => {
         this.queue = links;
         this.queueCurrent = 0;
         this.playPlaylist();
      });
   };
   public clearPlaylist = () => {
      this.queue = [];
      this.queueCurrent = null;
   };
   public playPlaylist = () => {
      const link = this.queue[this.queueCurrent];
      this.queueCurrent = (this.queueCurrent + 1) % this.queue.length;
      this.playYoutube(link, false);
   };
   public skip = () => {
      this.skipped = true;
      this.stop(false);
      this.playPlaylist();
   };

   public getChannels = () => this.channels;
}
