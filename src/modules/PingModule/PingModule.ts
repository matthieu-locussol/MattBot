import * as d from 'discord.js';
import { canAnswer } from '../common';

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      message.reply('pong !');
   }
};

export default handleMessage;
