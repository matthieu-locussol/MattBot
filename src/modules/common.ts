import * as d from 'discord.js';
import * as fs from 'fs';
import * as timeago from 'timeago.js';

const YOUTUBE_REGEX = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
const isYoutube = (link: string) => YOUTUBE_REGEX.test(link);

const locale = (number: number, index: number, totalSec: number): [string, string] => {
   return [
      ["À l'instant", 'dans un instant'],
      ['Il y a %s secondes', 'dans %s secondes'],
      ['Il y a 1 minute', 'dans 1 minute'],
      ['Il y a %s minutes', 'dans %s minutes'],
      ['Il y a 1 heure', 'dans 1 heure'],
      ['Il y a %s heures', 'dans %s heures'],
      ['Il y a 1 jour', 'dans 1 jour'],
      ['Il y a %s jours', 'dans %s jours'],
      ['Il y a 1 semaine', 'dans 1 semaine'],
      ['Il y a %s semaines', 'dans %s semaines'],
      ['Il y a 1 mois', 'dans 1 mois'],
      ['Il y a %s mois', 'dans %s mois'],
      ['Il y a 1 an', 'dans 1 an'],
      ['Il y a %s ans', 'dans %s ans'],
   ][index] as [string, string];
};

timeago.register('fr_FR', locale);

const getEmoji = (message: d.Message, name: string) => {
   const id = message.guild.emojis.cache.find((e) => e.name === name);
   return `<:${name}:${id}>`;
};

const canAnswer = (message: d.Message, channels: string[]) =>
   channels.length === 0 || (message.channel.type === 'text' && channels.includes(message.channel.name));

const loadData: any = (filename: string) => JSON.parse(fs.readFileSync(`src/data/${filename}`, 'UTF8'));

const saveData = (filename: string, data: any) =>
   fs.writeFileSync(`src/data/${filename}`, JSON.stringify(data, null, 3));

const isNotDM = (message: d.Message) => message.channel.type !== 'dm';

export { getEmoji, canAnswer, loadData, saveData, isNotDM, isYoutube };
