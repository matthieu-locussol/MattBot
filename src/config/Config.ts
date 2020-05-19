const config = {
   api: {
      key: {
         osu: process.env.OSU_API_KEY,
         discord: process.env.DISCORD_TOKEN,
      },
      endpoint: {
         beatmaps: process.env.BEATMAPS_ENDPOINT,
      },
   },
};

export default config;
