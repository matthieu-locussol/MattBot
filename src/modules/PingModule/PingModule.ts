import * as d from 'discord.js';
import { canAnswer } from '../common';

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      message.reply('pong !').then((sentMessage) => {
         const delay = sentMessage.createdAt.getTime() - message.createdAt.getTime();
         sentMessage.edit(`${sentMessage.content} (${delay}ms)`);
      });
   }
};

export default handleMessage;
