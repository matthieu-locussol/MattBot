import * as d from 'discord.js';
import * as ytdl from 'ytdl-core';
import * as musicSettings from '../data/music.json';

export default class MusicManager {
   private play: boolean;
   private queue: Array<string>;
   private connection: d.VoiceConnection;
   private dispatcher: d.StreamDispatcher;

   constructor() {
      this.play = false;
      this.queue = [];
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
      this.dispatcher.end();
   };
   public isInVocal = () => {
      return this.connection !== null;
   };
   public isPlaying = () => {
      return this.dispatcher !== null;
   };

   public initDispatcher = () => {
      this.setVolume(musicSettings.defaultVolume);
      // On finish: if music left in queue ; play it ; otherwise setDispatcher(null)
      this.dispatcher.on('finish', () => this.setDispatcher(null));
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
   public setVolume = (volume: number) => {
      this.dispatcher.setVolumeLogarithmic(volume / musicSettings.maxVolume);
   };

   public playYoutube = (link: string) => {
      const stream = ytdl(link, { filter: 'audioonly', highWaterMark: 1 << 25 });
      this.dispatcher = this.connection.play(stream);
      this.play = true;

      this.initDispatcher();
   };
}
