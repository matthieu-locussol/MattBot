import * as d from 'discord.js';
import { canAnswer } from '../common';

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      const asked = new Date().getTime();
      message.reply('pong !').then((sentMessage) => {
         const answered = sentMessage.createdAt.getTime();
         sentMessage.edit(`${sentMessage.content} (${answered - asked}ms)`);
      });
   }
};

export default handleMessage;
