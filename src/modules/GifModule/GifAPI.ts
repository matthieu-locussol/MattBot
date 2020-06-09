import Config from '../../config/Config';
import axios from 'axios';

const instance = axios.create({
   baseURL: Config.api.endpoint.giphy,
});

const formatUrl = (id: string) => `https://i.giphy.com/media/${id}/giphy.gif`;

const getSearchGif = async (query: string): Promise<string> => {
   try {
      const gif = await instance.get('/search', {
         params: {
            api_key: Config.api.key.giphy,
            q: query,
            limit: 1,
            lang: 'fr',
         },
      });

      return formatUrl(gif.data.data[0].id);
   } catch (error) {
      console.error(error);
   }
};

export default { getSearchGif };
