const config = {
   bot: {
      prefix: process.env.DEFAULT_PREFIX,
   },
   api: {
      key: {
         osu: process.env.OSU_API_KEY,
         giphy: process.env.GIPHY_API_KEY,
         discord: process.env.DISCORD_TOKEN,
         youtube: process.env.YOUTUBE_API_KEY,
      },
      endpoint: {
         youtube: process.env.YOUTUBE_API_ENDPOINT,
         youtubePlaylistName: process.env.YOUTUBE_API_TITLE_ENDPOINT,
         beatmaps: process.env.BEATMAPS_ENDPOINT,
         giphy: process.env.GIPHY_ENDPOINT,
      },
   },
};

export default config;
