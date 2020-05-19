const transformAlias = (aliases: Record<string, string>, message: string) => {
   for (const [alias, command] of Object.entries(aliases)) {
      if (message.startsWith(alias)) {
         return message.replace(alias, command);
      }
   }

   return message;
};

export default transformAlias;
