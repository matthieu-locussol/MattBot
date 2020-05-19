import * as d from 'discord.js';
import { canAnswer } from '../common';

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      const prefix = message.content[0];
      const attachment = new d.MessageAttachment('src/assets/bot_avatar.png', 'bot_avatar.png');
      const answer = new d.MessageEmbed()
         .attachFiles([attachment])
         .setTitle(`Commandes du JeckhysBot (préfixe: \`${prefix}\`)`)
         .setColor(0xa4b0be)
         .setThumbnail('attachment://bot_avatar.png')
         .setDescription(
            `\`${prefix}osu \` => Affiche l'aide relative à osu!
					\`${prefix}help\` => Affiche ce message
					\`${prefix}ping\` => Affiche le temps de latence du bot`,
         )
         .setFooter(`JeckhysBot par マチュー`)
         .setTimestamp();

      message.channel.send(answer);
   }
};

export default handleMessage;
