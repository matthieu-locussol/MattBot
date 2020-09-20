import * as d from 'discord.js';
import * as ytdl from 'ytdl-core';
import * as musicSettings from '../data/music.json';

export default class MusicManager {
   private play: boolean;
   private queue: Array<string>;
   private volume: number;
   private channels: string[];
   private connection: d.VoiceConnection;
   private dispatcher: d.StreamDispatcher;

   constructor() {
      this.play = false;
      this.queue = [];
      this.volume = musicSettings.defaultVolume;
      this.channels = ['playlists', 'dev-bot'];
      this.connection = null;
      this.dispatcher = null;
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
      this.setVolume(musicSettings.defaultVolume);
      // On finish: if music left in queue ; play it ; otherwise setDispatcher(null)
      this.dispatcher.on('finish', () => {
         this.play = false;
         this.setDispatcher(null);
      });
   };
   public getDispatcher = () => {
      return this.dispatcher;
   };
   public setDispatcher = (dispatcher: d.StreamDispatcher) => {
      this.dispatcher = dispatcher;
   };

   public stop = () => {
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

   public playYoutube = (link: string) => {
      const options: ytdl.downloadOptions = {
         highWaterMark: 1 << 25,
      };
      const stream = ytdl(link, options);
      this.dispatcher = this.connection.play(stream);
      this.play = true;

      this.initDispatcher();
   };

   public getChannels = () => this.channels;
}
