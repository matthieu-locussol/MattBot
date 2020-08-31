import * as d from 'discord.js';
import { canAnswer, isNotDM } from '../common';
import MusicManager from '../../core/MusicManager';
import { isYoutube } from '../common';

const updateVolume = (message: d.Message, musicManager: MusicManager, volume: number) => {
   if (volume >= 0 && volume <= 10) {
      musicManager.setVolume(volume);
      message.reply(`Volume mis à jour sur : ${volume}/10.`);
   } else {
      message.reply('Le volume doit être compris entre 0 et 10.');
   }
};

export const upVolume = (
   channel: d.TextChannel | d.DMChannel | d.NewsChannel,
   musicManager: MusicManager,
) => {
   if (musicManager.getVolume() < 10) {
      const volume = musicManager.getVolume() + 1;
      musicManager.setVolume(volume);
      channel.send(`Volume mis à jour sur : ${volume}/10.`);
   } else {
      channel.send('Le volume est déjà au maximum.');
   }
};

export const downVolume = (
   channel: d.TextChannel | d.DMChannel | d.NewsChannel,
   musicManager: MusicManager,
) => {
   if (musicManager.getVolume() > 0) {
      const volume = musicManager.getVolume() - 1;
      musicManager.setVolume(volume);
      channel.send(`Volume mis à jour sur : ${volume}/10.`);
   } else {
      channel.send('Le volume est déjà au minimum.');
   }
};

export const playMusic = (url: string, message: d.Message, musicManager: MusicManager) => {
   const prefix = message.content[0] === 'h' ? '!' : message.content[0];
   const voiceChannel = message.member.voice.channel;

   if (voiceChannel) {
      if (!musicManager.isPlaying()) {
         musicManager.join(voiceChannel).then(() => {
            musicManager.playYoutube(url);
         });
      } else {
         message.reply(
            `Une musique est déjà en cours, utilise \`${prefix}music play force\` pour forcer le changement.`,
         );
      }
   } else {
      message.reply("Rejoins d'abord un canal vocal, connard.");
   }
};

const playMusicForce = (url: string, message: d.Message, musicManager: MusicManager) => {
   musicManager.stop();
   playMusic(url, message, musicManager);
};

const handleMessage = (
   args: string[],
   message: d.Message,
   musicManager: MusicManager,
   channels: string[] = [],
) => {
   if (canAnswer(message, channels) && isNotDM(message)) {
      const prefix = message.content[0];
      // !music volume <number>
      if (args.length === 2 && args[0] === 'volume') {
         const volume = parseInt(args[1]);
         updateVolume(message, musicManager, volume);
      }
      // !music break
      else if (args.length === 1 && args[0] === 'break') {
         musicManager.pause();
      }
      // !music resume
      else if (args.length === 1 && args[0] === 'resume') {
         musicManager.resume();
      }
      // !music play <link>
      else if (args.length === 2 && args[0] === 'play') {
         const url = args[1];

         if (isYoutube(url)) {
            playMusic(url, message, musicManager);
         }
      }
      // !music play force <link>
      else if (args.length === 3 && args[0] === 'play' && args[1] === 'force') {
         const url = args[2];

         if (isYoutube(url)) {
            playMusicForce(url, message, musicManager);
         }
      }
      // !music
      else if (args.length === 0) {
         const attachment = new d.MessageAttachment('src/assets/music/music_avatar.png', 'music_avatar.png');
         const answer = new d.MessageEmbed()
            .attachFiles([attachment])
            .setTitle(`Commandes liées à la musique`)
            .setColor(0x6b81ff)
            .setThumbnail('attachment://music_avatar.png')
            .setDescription(
               `\`${prefix}music\` => Affiche l'aide relative à la musique
					   \`${prefix}music play <link>\` => Joue une musique
					   \`${prefix}music play force <link>\` => Remplace la musique actuellement en cours
					   \`${prefix}music volume <1..10>\` => Change le volume du bot`,
            )
            .setFooter(`MattBot par マチュー`)
            .setTimestamp();

         message.channel.send(answer);
      }
      // !music ??? [...???]
      else {
         const answer = new d.MessageEmbed()
            .setDescription(`Commande \`${prefix}music\` introuvable : \`${message.content}\``)
            .setFooter(`Pour voir les commandes existantes, tape : ${prefix}music`)
            .setTimestamp();

         message.channel.send(answer);
      }
   }
};

export default handleMessage;
