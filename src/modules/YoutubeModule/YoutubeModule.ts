import * as d from 'discord.js';
import { canAnswer } from '../common';

const handleMessage = (message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      const emoji = message.client.emojis.cache.find((e) => e.name === 'play');
      message.react(emoji);
   }
};

export default handleMessage;
