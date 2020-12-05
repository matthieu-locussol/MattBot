import * as d from 'discord.js';
import { canAnswer } from '../common';

const tellMeMore = (message: d.Message) => {
   const attachment = new d.MessageAttachment('src/assets/memes/dmp.png', 'dmp.png');
   message.channel.send(attachment);
};

const tellMyHorse = (message: d.Message) => {
   const attachment = new d.MessageAttachment('src/assets/memes/findus.png', 'findus.png');
   message.channel.send(attachment);
};

const handleMessage = (args: string[], message: d.Message, channels: string[] = []) => {
   if (canAnswer(message, channels)) {
      // !meme dmp
      if (args.length === 1 && args[0] === 'dmp') {
         tellMeMore(message);
      }
      // !meme findus
      else if (args.length === 1 && args[0] === 'findus') {
         tellMyHorse(message);
      }
   }
};

export default handleMessage;
