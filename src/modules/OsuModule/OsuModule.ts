import * as d from 'discord.js';
import OsuAPI from './OsuAPI';
import { getEmoji, canAnswer, loadData, saveData } from '../common';

export interface OsuEntry {
   discordId: string;
   username: string;
}

const sep = '•';
const datas: OsuEntry[] = loadData('osu.json');
const colors = {
   RankF: 0xe7434a,
   RankD: 0xf33836,
   RankC: 0xff35f0,
   RankB: 0x3b73ff,
   RankA: 0x46e424,
   RankS: 0xfef337,
   RankSH: 0xddfaff,
   RankX: 0xfef337,
   RankXH: 0xddfaff,
};
const colorOsu = '0xff4757';

const bestPlays = (message: d.Message, username: string, number: number = 3) => {
   if (number >= 1 && number <= 10) {
      OsuAPI.getUserBest(username, number)
         .then((recent) =>
            message.channel.send(
               new d.MessageEmbed()
                  .setAuthor(
                     `${recent.player.name} : ${recent.player.pp.raw}pp | WR ${sep} #${recent.player.pp.rank} | ${recent.player.country} ${sep} #${recent.player.pp.countryRank}`,
                     `https://osu.ppy.sh/images/flags/${recent.player.country}.png`,
                     recent.player.url,
                  )
                  .setColor(colorOsu)
                  .setThumbnail(recent.player.avatar)
                  .addFields(
                     recent.scores.map((s) => ({
                        name: `${getEmoji(message, s.rankEmoji)}${
                           s.mods ? ` ${sep} **${s.mods}**` : ''
                        } ${sep} ${s.beatmap.name}`,
                        value: `**${s.pp}pp** ${sep} ${s.accuracy}% ${sep} [[${s.beatmap.difficulty}]](${s.beatmap.url}) ${sep} ${s.date}`,
                     })),
                  )
                  .setFooter(`MattBot par マチュー`),
            ),
         )
         .catch(() =>
            message.channel.send(
               new d.MessageEmbed()
                  .setColor(colorOsu)
                  .setDescription('Problème dans la récupération des meilleurs scores...')
                  .setFooter(`MattBot par マチュー`)
                  .setTimestamp(),
            ),
         );
   } else {
      message.reply('Je peux pas récupérer plus que tes 10 meilleurs scores !');
   }
};

const recentPlay = (message: d.Message, username: string, number: number = 1) => {
   if (number >= 1 && number <= 50) {
      OsuAPI.getUserRecent(username, number)
         .then((recent) =>
            message.channel.send(
               new d.MessageEmbed()
                  .setAuthor(
                     `${recent.player.name} : ${recent.player.pp.raw}pp | WR ${sep} #${recent.player.pp.rank} | ${recent.player.country} ${sep} #${recent.player.pp.countryRank}`,
                     recent.player.avatar,
                     recent.player.url,
                  )
                  .attachFiles(['src/data/chart.png'])
                  .setImage('attachment://chart.png')
                  .setDescription(
                     `${recent.wr ? `***Record mondial #${recent.wr}***` : ''}${
                        recent.wr && recent.pb ? ` ${sep} ` : ''
                     }${recent.pb ? `***Record personnel #${recent.pb}***` : ''}`,
                  )
                  .setColor(colors[recent.rankEmoji])
                  .setTitle(
                     `${recent.beatmap.artist} - ${recent.beatmap.name} [${recent.beatmap.difficulty}]`,
                  )
                  .setURL(recent.beatmap.url)
                  .setThumbnail(recent.beatmap.thumbnail)
                  .addField(
                     `${getEmoji(message, recent.rankEmoji)}${
                        recent.rankEmoji === 'RankF' ? `(${recent.progress}%)` : ''
                     }${recent.mods ? ` ${sep} **${recent.mods}**` : ''} ${sep} ${recent.score} ${sep} ${
                        recent.accuracy
                     }% ${sep} ${recent.date}`,
                     `**${recent.pp.score.pp}pp →** ${
                        recent.pp.isFc ? `**FC**` : `${recent.pp.fc.pp}pp si ${recent.pp.fc.accuracy} FC`
                     } ${sep} **${recent.maxCombo}x**/${recent.beatmap.maxCombo}x \n **${
                        recent.counts[300]
                     }**x300 ${sep} **${recent.counts[100]}**x100 ${sep} **${
                        recent.counts[50]
                     }**x50 ${sep} **${recent.counts['miss']}**xMiss`,
                  )
                  .addField(
                     `Informations sur la map`,
                     `${recent.beatmap.duration} ${sep} CS**${recent.beatmap.cs}** HP**${recent.beatmap.hp}** OD**${recent.beatmap.od}** AR**${recent.beatmap.ar}** ${sep} **${recent.beatmap.bpm}** BPM ${sep} **${recent.pp.score.stars} ★**`,
                  )
                  .setFooter(
                     `Mappé par ${recent.mapper.name} ${sep} ${recent.beatmap.approval} le ${recent.beatmap.approvalDate}`,
                     recent.mapper.avatar,
                  ),
            ),
         )
         .catch(() =>
            message.channel.send(
               new d.MessageEmbed()
                  .setColor(colorOsu)
                  .setDescription(
                     `\`${username}\` n'a pas joué récemment, ou a peut-être changé de pseudonyme ?`,
                  )
                  .setFooter(`MattBot par マチュー`)
                  .setTimestamp(),
            ),
         );
   } else {
      message.reply('Je peux pas récupérer de score plus ancien que ton 50ème score le plus récent !');
   }
};

const bestBeatmapPlay = (message: d.Message, username: string, beatmapId: string) => {
   OsuAPI.getUserBestBeatmap(username, beatmapId)
      .then((recent) =>
         message.channel.send(
            new d.MessageEmbed()
               .setAuthor(
                  `${recent.player.name} : ${recent.player.pp.raw}pp | WR ${sep} #${recent.player.pp.rank} | ${recent.player.country} ${sep} #${recent.player.pp.countryRank}`,
                  recent.player.avatar,
                  recent.player.url,
               )
               .attachFiles(['src/data/chart.png'])
               .setImage('attachment://chart.png')
               .setDescription(
                  `${recent.wr ? `***Record mondial #${recent.wr}***` : ''}${
                     recent.wr && recent.pb ? ` ${sep} ` : ''
                  }${recent.pb ? `***Record personnel #${recent.pb}***` : ''}`,
               )
               .setColor(colors[recent.rankEmoji])
               .setTitle(`${recent.beatmap.artist} - ${recent.beatmap.name} [${recent.beatmap.difficulty}]`)
               .setURL(recent.beatmap.url)
               .setThumbnail(recent.beatmap.thumbnail)
               .addField(
                  `${getEmoji(message, recent.rankEmoji)}${
                     recent.rankEmoji === 'RankF' ? `(${recent.progress}%)` : ''
                  }${recent.mods ? ` ${sep} **${recent.mods}**` : ''} ${sep} ${recent.score} ${sep} ${
                     recent.accuracy
                  }% ${sep} ${recent.date}`,
                  `**${recent.pp.score.pp}pp →** ${
                     recent.pp.isFc ? `**FC**` : `${recent.pp.fc.pp}pp si ${recent.pp.fc.accuracy} FC`
                  } ${sep} **${recent.maxCombo}x**/${recent.beatmap.maxCombo}x \n **${
                     recent.counts[300]
                  }**x300 ${sep} **${recent.counts[100]}**x100 ${sep} **${recent.counts[50]}**x50 ${sep} **${
                     recent.counts['miss']
                  }**xMiss`,
               )
               .addField(
                  `Informations sur la map`,
                  `${recent.beatmap.duration} ${sep} CS**${recent.beatmap.cs}** HP**${recent.beatmap.hp}** OD**${recent.beatmap.od}** AR**${recent.beatmap.ar}** ${sep} **${recent.beatmap.bpm}** BPM ${sep} **${recent.pp.score.stars} ★**`,
               )
               .setFooter(
                  `Mappé par ${recent.mapper.name} ${sep} ${recent.beatmap.approval} le ${recent.beatmap.approvalDate}`,
                  recent.mapper.avatar,
               ),
         ),
      )
      .catch(() =>
         message.channel.send(
            new d.MessageEmbed()
               .setColor(colorOsu)
               .setDescription(`\`${username}\` n'a jamais joué ou terminé cette map.`)
               .setFooter(`MattBot par マチュー`)
               .setTimestamp(),
         ),
      );
};

const updateOsuUsername = (message: d.Message, args: string[]) => {
   const username = args.slice(1).join(' ');
   const discordId = message.author.id;

   if (datas.some((u) => u.discordId === discordId)) {
      const entry = datas.find((u) => u.discordId === discordId);
      entry.username = username;
   } else {
      datas.push({ discordId: discordId, username: username });
   }

   saveData('osu.json', datas);
   message.reply(`ton pseudo sur osu! a bien été mis à jour : \`${username}\``);
};

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      const prefix = message.content[0];
      // !osu username <username>
      if (args.length >= 2 && args[0] === 'username') {
         updateOsuUsername(message, args);
      }
      // !osu recent
      else if (args.length === 1 && args[0] === 'recent') {
         const discordId = message.author.id;
         const user = datas.find((u) => u.discordId === discordId);

         if (user) {
            recentPlay(message, user.username);
         } else {
            message.reply(
               `tu n'as aucun nom d'utilisateur osu! assigné. Utilise la commande \`${prefix}osu username <username>\` pour ça !`,
            );
         }
      }
      // !osu recent [number]
      else if (args.length === 2 && args[0] === 'recent' && /^\d+$/.test(args[1])) {
         const discordId = message.author.id;
         const user = datas.find((u) => u.discordId === discordId);

         if (user) {
            recentPlay(message, user.username, parseInt(args[1]));
         } else {
            message.reply(
               `tu n'as aucun nom d'utilisateur osu! assigné. Utilise la commande \`${prefix}osu username <username>\` pour ça !`,
            );
         }
      }
      // !osu recent [number] [username]
      else if (args.length >= 2 && args[0] === 'recent') {
         // !osu recent [number] [username]
         if (/^\d+$/.test(args[1])) {
            const number = parseInt(args[1]);
            const username = args.slice(2).join(' ');
            recentPlay(message, username, number);
         }
         // !osu recent [username]
         else {
            const username = args.slice(1).join(' ');
            recentPlay(message, username);
         }
      }
      // !osu
      else if (args.length === 0) {
         const attachment = new d.MessageAttachment('src/assets/osu/osu_logo.png', 'osu_logo.png');
         const answer = new d.MessageEmbed()
            .attachFiles([attachment])
            .setTitle(`Commandes liées à osu!`)
            .setColor(0xff6b81)
            .setThumbnail('attachment://osu_logo.png')
            .setDescription(
               `\`${prefix}osu\` => Affiche l'aide relative à osu!
						\`${prefix}osu best [1..10] [username]\` => Affiche les meilleurs scores
						\`${prefix}osu recent [1..50] [username]\` => Affiche le score le plus récent
						\`${prefix}osu beatmap <beatmapId> [username]\` => Affiche le meilleur score sur une map
						\`${prefix}osu username <username>\` => Associe ton username sur osu!`,
            )
            .setFooter(`MattBot par マチュー`)
            .setTimestamp();

         message.channel.send(answer);
      }
      // !osu best
      else if (args.length === 1 && args[0] === 'best') {
         const discordId = message.author.id;
         const user = datas.find((u) => u.discordId === discordId);

         if (user) {
            bestPlays(message, user.username);
         } else {
            message.reply(
               `tu n'as aucun nom d'utilisateur osu! assigné. Utilise la commande \`${prefix}osu username <username>\` pour ça !`,
            );
         }
      }
      // !osu best [number]
      else if (args.length === 2 && args[0] === 'best' && /^\d+$/.test(args[1])) {
         const discordId = message.author.id;
         const user = datas.find((u) => u.discordId === discordId);

         if (user) {
            bestPlays(message, user.username, parseInt(args[1]));
         } else {
            message.reply(
               `tu n'as aucun nom d'utilisateur osu! assigné. Utilise la commande \`${prefix}osu username <username>\` pour ça !`,
            );
         }
      }
      // !osu best [number] [username]
      else if (args.length >= 2 && args[0] === 'best') {
         // !osu best [number] [username]
         if (/^\d+$/.test(args[1])) {
            const number = parseInt(args[1]);
            const username = args.slice(2).join(' ');
            bestPlays(message, username, number);
         }
         // !osu best [username]
         else {
            const username = args.slice(1).join(' ');
            bestPlays(message, username);
         }
      }
      // !osu beatmap <beatmapId>
      else if (args.length === 2 && args[0] === 'beatmap') {
         const discordId = message.author.id;
         const user = datas.find((u) => u.discordId === discordId);

         if (user) {
            bestBeatmapPlay(message, user.username, args[1]);
         } else {
            message.reply(
               `tu n'as aucun nom d'utilisateur osu! assigné. Utilise la commande \`${prefix}osu username <username>\` pour ça !`,
            );
         }
      }
      // !osu beatmap <beatmapId> [username]
      else if (args.length >= 3 && args[0] === 'beatmap') {
         const username = args.slice(2).join(' ');
         const beatmapId = args[1];
         bestBeatmapPlay(message, username, beatmapId);
      }
      // !osu ??? [...???]
      else {
         const answer = new d.MessageEmbed()
            .setDescription(`Commande \`${prefix}osu\` introuvable : \`${message.content}\``)
            .setFooter(`Pour voir les commandes existantes, tape : ${prefix}osu`)
            .setTimestamp();

         message.channel.send(answer);
      }
   }
};

export default handleMessage;
