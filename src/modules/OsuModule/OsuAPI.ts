import * as nodeOsu from 'node-osu';
import Config from '../../config/Config';
import { format } from 'timeago.js';
import axios from 'axios';
import { exec } from 'child-process-promise';
import * as moment from 'moment';

const instance = new nodeOsu.Api(Config.api.key.osu, {
   completeScores: true,
});

const instanceBeatmaps = axios.create({
   baseURL: Config.api.endpoint.beatmaps,
});

const modsBitset = {
   None: 0,
   Easy: 1 << 1,
   HardRock: 1 << 4,
   DoubleTime: 1 << 6,
   HalfTime: 1 << 8,
};

const getNumeric = (n: string | number): number => {
   return typeof n == 'number' ? n : parseInt(n);
};

const formatDuration = (duration: string | number) =>
   `${Math.floor(getNumeric(duration) / 60)}:${getNumeric(duration) % 60}`;

const formatAccuracy = (accuracy: number) => Math.round(accuracy * 10000) / 100;

const formatDate = (date: Date) => format(date, 'fr_FR');
const formatApprovalDate = (date: Date) => moment(date).locale('fr').format('DD MMM YYYY');

const formatMods = (mods: string[]) => {
   let valuesMods = 0;
   let formattedMods = '+';

   mods.includes('NoFail') && (formattedMods += 'NF');
   mods.includes('Easy') && (formattedMods += 'EZ') && (valuesMods += modsBitset.Easy);
   mods.includes('Hidden') && (formattedMods += 'HD');
   mods.includes('HardRock') && (formattedMods += 'HR') && (valuesMods += modsBitset.HardRock);
   mods.includes('HalfTime') && (formattedMods += 'HT') && (valuesMods += modsBitset.HalfTime);
   mods.includes('FlashLight') && (formattedMods += 'FL');
   mods.includes('SpunOut') && (formattedMods += 'SO');

   if (mods.includes('DoubleTime') && mods.includes('Nightcore')) {
      formattedMods += 'NC';
      valuesMods += modsBitset.DoubleTime;
   } else if (mods.includes('DoubleTime')) {
      formattedMods += 'DT';
      valuesMods += modsBitset.DoubleTime;
   }

   if (mods.includes('Perfect') && mods.includes('SuddenDeath')) {
      formattedMods += 'PF';
   } else if (mods.includes('SuddenDeath')) {
      formattedMods += 'SD';
   }

   formattedMods = formattedMods === '+' ? '' : formattedMods;

   return {
      mods: formattedMods,
      values: valuesMods,
   };
};

const formatNumber = (s: number) => s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const getAR = (difficulty: nodeOsu.BeatmapDifficulty, beatmapDifficulties: any, mods: number) =>
   beatmapDifficulties[mods] ? Math.round(beatmapDifficulties[mods].ar * 10) / 10 : difficulty.approach;

const getOD = (difficulty: nodeOsu.BeatmapDifficulty, beatmapDifficulties: any, mods: number) =>
   beatmapDifficulties[mods] ? Math.round(beatmapDifficulties[mods].od * 10) / 10 : difficulty.overall;

const formatApproval = (approval: string) =>
   ({
      Graveyard: 'Cimetière',
      WIP: 'WIP',
      Pending: 'En attente',
      Ranked: 'Classée',
      Approved: 'Approuvée',
      Qualified: 'Qualifiée',
      Loved: 'Loved',
   }[approval]);

const formatProgress = (score: nodeOsu.Score) =>
   formatAccuracy(
      (getNumeric(score.counts[300]) +
         getNumeric(score.counts[100]) +
         getNumeric(score.counts[50]) +
         getNumeric(score.counts.miss)) /
         (getNumeric(score.beatmap.objects.normal) +
            getNumeric(score.beatmap.objects.slider) +
            getNumeric(score.beatmap.objects.spinner)),
   );

export interface OsuScore {
   id: string;
   pp: OsuScorePP;
   date: string;
   mods: string;
   rankEmoji: string;
   score: string;
   accuracy: number;
   maxCombo: string | number;
   counts: nodeOsu.ScoreCounts;
   progress: number;
   beatmap: {
      url: string;
      name: string;
      artist: string;
      maxCombo: string | number;
      thumbnail: string;
      difficulty: string;
      cs: string | number;
      ar: string | number;
      od: string | number;
      hp: string | number;
      bpm: string | number;
      duration: string | number;
      approval: string;
      approvalDate: string;
   };
   player: {
      pp: nodeOsu.UserPP;
      url: string;
      name: string;
      avatar: string;
      country: string;
   };
   mapper: {
      name: string;
      avatar: string;
   };
}

export interface OsuScorePP {
   score: {
      stars: string;
      accuracy: string;
      pp: string;
   };
   fc: {
      stars: string;
      accuracy: string;
      pp: string;
   };
   isFc: boolean;
}

const getScorePP = async (
   id: string,
   mods: string,
   acc: number,
   combo: string | number,
   maxCombo: string | number,
   miss: string | number,
): Promise<OsuScorePP> => {
   const command = `curl https://osu.ppy.sh/osu/${id} | node dist/modules/OsuModule/OsuPP ${mods} ${acc}% ${combo}x ${miss}m`;
   const commandFC = `curl https://osu.ppy.sh/osu/${id} | node dist/modules/OsuModule/OsuPP ${mods} ${acc}% ${maxCombo}x`;
   const [results, resultsFC] = await Promise.all([
      (async () => (await exec(command)).stdout.split(' '))(),
      (async () => (await exec(commandFC)).stdout.split(' '))(),
   ]);
   return {
      score: {
         stars: results[0],
         accuracy: results[1],
         pp: results[2],
      },
      fc: {
         stars: resultsFC[0],
         accuracy: resultsFC[1],
         pp: resultsFC[2],
      },
      isFc: resultsFC[2] === results[2],
   };
};

const getUserRecent = async (username: string, number: number): Promise<OsuScore> => {
   try {
      const [user, recent] = await Promise.all([
         instance.getUser({ u: username }),
         (async () => (await instance.getUserRecent({ u: username, limit: number }))[number - 1])(),
      ]);

      const formattedMods = formatMods(recent.mods);

      const [beatmapInfos, pp] = await Promise.all([
         (async () => await instanceBeatmaps.get(`/b/${recent.beatmapId}`))(),
         getScorePP(
            recent.beatmapId,
            formattedMods.mods,
            formatAccuracy(recent.accuracy),
            recent.maxCombo,
            recent.beatmap.maxCombo,
            recent.counts.miss,
         ),
      ]);

      const beatmap = beatmapInfos.data.beatmap;
      const beatmapDifficulty = beatmapInfos.data.difficulty;

      return {
         id: user.id,
         pp: pp,
         date: formatDate(recent.date),
         mods: formatMods(recent.mods).mods,
         rankEmoji: `Rank${recent.rank}`,
         score: formatNumber(getNumeric(recent.score)),
         accuracy: formatAccuracy(recent.accuracy),
         maxCombo: recent.maxCombo,
         counts: recent.counts,
         progress: formatProgress(recent),
         beatmap: {
            url: `https://osu.ppy.sh/beatmaps/${recent.beatmapId}`,
            name: recent.beatmap.title,
            artist: recent.beatmap.artist,
            thumbnail: `https://b.ppy.sh/thumb/${recent.beatmap.beatmapSetId}l.jpg`,
            maxCombo: recent.beatmap.maxCombo,
            difficulty: recent.beatmap.version,
            cs: recent.beatmap.difficulty.size,
            ar: getAR(recent.beatmap.difficulty, beatmapDifficulty, formattedMods.values),
            od: getOD(recent.beatmap.difficulty, beatmapDifficulty, formattedMods.values),
            hp: recent.beatmap.difficulty.drain,
            bpm: recent.beatmap.bpm,
            duration: formatDuration(recent.beatmap.length.total),
            approval: formatApproval(recent.beatmap.approvalStatus),
            approvalDate: formatApprovalDate(recent.beatmap.approvedDate),
         },
         player: {
            pp: {
               raw: formatNumber(getNumeric(user.pp.raw)),
               rank: formatNumber(getNumeric(user.pp.rank)),
               countryRank: formatNumber(getNumeric(user.pp.countryRank)),
            },
            url: `https://osu.ppy.sh/users/${user.id}`,
            name: `${user.name}`,
            avatar: `https://a.ppy.sh/${user.id}`,
            country: user.country,
         },
         mapper: {
            name: `${recent.beatmap.creator}`,
            avatar: `https://a.ppy.sh/${beatmap.creator_id}`,
         },
      };
   } catch (error) {
      console.error(error);
   }
};

export default { instance, getUserRecent };
