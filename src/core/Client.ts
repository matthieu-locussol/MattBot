import * as d from 'discord.js';
import Config from '../config/Config';
import transformAlias from '../modules/alias';
import handleOsuModule from '../modules/OsuModule/OsuModule';
import handleHelpModule from '../modules/HelpModule/HelpModule';
import handlePingModule from '../modules/PingModule/PingModule';
import handle____Module from '../modules/____Module/____Module';
import handleReactModule from '../modules/ReactModule/ReactModule';

interface ClientOptions {
   aliases: Record<string, string>;
   commandPrefix?: string;
   readyMessage?: string;
}

const DefaultClientOptions: ClientOptions = {
   aliases: {},
   commandPrefix: Config.bot.prefix,
   readyMessage: 'JeckhysBot is running...',
};

export default class Client {
   private token: string;
   private options: ClientOptions;
   private discordClient: d.Client;

   constructor(options?: ClientOptions, token: string = Config.api.key.discord) {
      this.token = token;
      this.options = { ...DefaultClientOptions, ...options };
      this.discordClient = new d.Client();
   }

   public run() {
      this.discordClient.on('ready', () => console.log(this.options.readyMessage));
      this.discordClient.on('message', (message) => this.handleMessage(message));
      this.discordClient.on('messageReactionAdd', (reaction, user) =>
         this.handleMessageReaction(reaction, user),
      );
      this.discordClient.login(this.token);
   }

   private isCommand(prefix: string) {
      return prefix === this.options.commandPrefix;
   }

   private parseCommand(command: string) {
      return command.slice(1).split(' ');
   }

   private switchCommand(command: string, args: string[], cases: Record<string, () => void>) {
      Object.keys(cases).includes(command) && cases[command]();
   }

   private handleMessage(message: d.Message) {
      const isCommand = this.isCommand(message.content[0]);

      if (isCommand) {
         message.content = transformAlias(this.options.commandPrefix, this.options.aliases, message.content);
         const [command, ...args] = this.parseCommand(message.content);

         this.switchCommand(command, args, {
            osu: () => handleOsuModule(args, message),
            help: () => handleHelpModule(args, message),
            ping: () => handlePingModule(args, message),
         });
      }
   }

   private handleMessageReaction(reaction: d.MessageReaction, user: d.User | d.PartialUser) {
      handle____Module(reaction, user);
      handleReactModule(reaction, user);
   }
}
