const transformAlias = (prefix: string, aliases: Record<string, string>, message: string) => {
   for (const [alias, command] of Object.entries(aliases)) {
      if (message.startsWith(prefix + alias)) {
         return message.replace(prefix + alias, prefix + command);
      }
   }

   return message;
};

export default transformAlias;
