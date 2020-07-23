import * as nodeOsu from 'node-osu';
import Config from '../../config/Config';
import { format } from 'timeago.js';
import axios from 'axios';
import { exec } from 'child-process-promise';
import * as moment from 'moment';

const instance = new nodeOsu.Api(Config.api.key.osu);

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

const computeAccuracy = (counts: nodeOsu.ScoreCounts) => {
   return (
      (getNumeric(counts[300]) * 300 + getNumeric(counts[100]) * 100 + getNumeric(counts[50]) * 50) /
      ((getNumeric(counts[300]) +
         getNumeric(counts[100]) +
         getNumeric(counts[50]) +
         getNumeric(counts.miss)) *
         300)
   );
};

const formatAccuracy = (accuracy: number) => Math.round(accuracy * 10000) / 100;

const formatDate = (date: Date) => format(date, 'fr_FR');
const formatApprovalDate = (date: Date) => moment(date).locale('fr').format('DD MMM YYYY');

const formatMods = (mods: string[]) => {
   let valuesMods = 0;
   let formattedMods = '+';

   console.log('mods', mods);

   mods.includes('NoFail') && (formattedMods += 'NF');
   mods.includes('Easy') && (formattedMods += 'EZ') && (valuesMods += modsBitset.Easy);
   mods.includes('Hidden') && (formattedMods += 'HD');
   mods.includes('HardRock') && (formattedMods += 'HR') && (valuesMods += modsBitset.HardRock);
   mods.includes('HalfTime') && (formattedMods += 'HT') && (valuesMods += modsBitset.HalfTime);
   mods.includes('Flashlight') && (formattedMods += 'FL');
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

const getAR = (defaultAR: number, beatmapDifficulties: any, mods: number) =>
   beatmapDifficulties[mods] ? Math.round(beatmapDifficulties[mods].ar * 10) / 10 : defaultAR;

const getOD = (defaultOD: number, beatmapDifficulties: any, mods: number) =>
   beatmapDifficulties[mods] ? Math.round(beatmapDifficulties[mods].od * 10) / 10 : defaultOD;

const formatApproval = (approval: string) =>
   ({
      '-2': 'Cimetière',
      '-1': 'WIP',
      '0': 'En attente',
      '1': 'Classée',
      '2': 'Approuvée',
      '3': 'Qualifiée',
      '4': 'Loved',
   }[approval]);

const formatProgress = (score: nodeOsu.Score, beatmap: any) =>
   formatAccuracy(
      (getNumeric(score.counts[300]) +
         getNumeric(score.counts[100]) +
         getNumeric(score.counts[50]) +
         getNumeric(score.counts.miss)) /
         beatmap.hit_objects,
   );

const formatBPM = (beatmap: any) =>
   beatmap.bpm_min === beatmap.bpm_max ? beatmap.bpm : `${beatmap.bpm_min}-${beatmap.bpm_max}`;

export interface BestScore {
   id: string;
   score: string | number;
}

const formatPB = (score: nodeOsu.Score, beatmapId: string, bestScores: BestScore[]) => {
   const itemIndex = bestScores.findIndex((s) => s.id === beatmapId && s.score === score.score);
   const pb = itemIndex === -1 ? 0 : itemIndex + 1;

   return pb;
};

const formatWR = (score: nodeOsu.Score, mapScores: (string | number)[]) => {
   const itemIndex = mapScores.findIndex((s) => s === score.score);
   const wr = itemIndex === -1 ? 0 : itemIndex + 1;

   return wr;
};

const formatVersion = (version: string) => (version.length > 20 ? `${version.slice(0, 20)}...` : version);
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
   pb: number;
   wr: number;
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

export interface OsuBest {
   player: {
      pp: nodeOsu.UserPP;
      url: string;
      name: string;
      avatar: string;
      country: string;
   };
   scores: OsuBestScore[];
}

export interface OsuBestScore {
   score: string | number;
   accuracy: number;
   rankEmoji: string;
   date: string;
   mods: string;
   pp: number;
   beatmap: {
      url: string;
      name: string;
      artist: string;
      difficulty: string;
   };
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
      const [recent] = await Promise.all([
         (async () => (await instance.getUserRecent({ u: username, limit: number }))[number - 1])(),
      ]);

      const [user, beatmapInfos] = await Promise.all([
         instance.getUser({ u: username }),
         (async () => await instanceBeatmaps.get(`/b/${recent.beatmapId}`))(),
      ]);

      const beatmap = beatmapInfos.data.beatmap;
      const beatmapDifficulty = beatmapInfos.data.difficulty;

      const accuracy = formatAccuracy(computeAccuracy(recent.counts));
      const formattedMods = formatMods(recent.mods);

      const [pp, mapBests, userBests] = await Promise.all([
         getScorePP(
            recent.beatmapId,
            formattedMods.mods,
            accuracy,
            recent.maxCombo,
            beatmapInfos.data.beatmap.max_combo,
            recent.counts.miss,
         ),
         (async () => await instance.getScores({ b: recent.beatmapId, limit: 100 }))(),
         (async () => await instance.getUserBest({ u: username, limit: 100 }))(),
      ]);

      const bestScores = userBests.map((b) => ({
         id: b.beatmapId,
         score: b.score,
      }));

      const mapBestScores = mapBests.map((s) => s.score);

      return {
         id: user.id,
         pp: pp,
         date: formatDate(recent.date),
         mods: formatMods(recent.mods).mods,
         rankEmoji: `Rank${recent.rank}`,
         score: formatNumber(getNumeric(recent.score)),
         accuracy,
         maxCombo: recent.maxCombo,
         counts: recent.counts,
         progress: formatProgress(recent, beatmap),
         pb: formatPB(recent, recent.beatmapId, bestScores),
         wr: formatWR(recent, mapBestScores),
         beatmap: {
            url: `https://osu.ppy.sh/beatmaps/${recent.beatmapId}`,
            name: beatmap.title,
            artist: beatmap.artist,
            thumbnail: `https://b.ppy.sh/thumb/${beatmap.beatmapset_id}l.jpg`,
            maxCombo: beatmap.max_combo,
            difficulty: beatmap.version,
            cs: beatmap.cs,
            ar: getAR(beatmap.ar, beatmapDifficulty, formattedMods.values),
            od: getOD(beatmap.od, beatmapDifficulty, formattedMods.values),
            hp: beatmap.hp,
            bpm: formatBPM(beatmap),
            duration: formatDuration(beatmap.total_length),
            approval: formatApproval(beatmap.approved),
            approvalDate: formatApprovalDate(beatmap.approved_date),
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
            name: `${beatmap.creator}`,
            avatar: `https://a.ppy.sh/${beatmap.creator_id}`,
         },
      };
   } catch (error) {
      console.error(error);
   }
};

const getUserBest = async (username: string, number: number): Promise<OsuBest> => {
   try {
      const [user, best] = await Promise.all([
         instance.getUser({ u: username }),
         (async () => await instance.getUserBest({ u: username, limit: number }))(),
      ]);

      const maps = await Promise.all(
         best.map((b) =>
            (async () => await (await instanceBeatmaps.get(`/b/${b.beatmapId}`)).data.beatmap)(),
         ),
      );

      return {
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
         scores: best.map((b, i) => ({
            score: b.score,
            accuracy: formatAccuracy(computeAccuracy(b.counts)),
            rankEmoji: `Rank${b.rank}`,
            date: formatDate(b.date),
            mods: formatMods(b.mods).mods,
            pp: Math.round(getNumeric(b.pp)),
            beatmap: {
               url: `https://osu.ppy.sh/beatmaps/${b.beatmapId}`,
               name: maps[i].title,
               artist: maps[i].artist,
               difficulty: formatVersion(maps[i].version),
            },
         })),
      };
   } catch (error) {
      console.error(error);
   }
};

const getUserBestBeatmap = async (username: string, beatmapId: string): Promise<OsuScore> => {
   try {
      const [score] = await Promise.all([
         (async () => (await instance.getScores({ b: beatmapId, u: username }))[0])(),
      ]);

      const [user, beatmapInfos] = await Promise.all([
         instance.getUser({ u: username }),
         (async () => await instanceBeatmaps.get(`/b/${beatmapId}`))(),
      ]);

      const beatmap = beatmapInfos.data.beatmap;
      const beatmapDifficulty = beatmapInfos.data.difficulty;

      const accuracy = formatAccuracy(computeAccuracy(score.counts));
      const formattedMods = formatMods(score.mods);

      const [pp, mapBests, userBests] = await Promise.all([
         getScorePP(
            beatmapId,
            formattedMods.mods,
            accuracy,
            score.maxCombo,
            beatmapInfos.data.beatmap.max_combo,
            score.counts.miss,
         ),
         (async () => await instance.getScores({ b: beatmapId, limit: 100 }))(),
         (async () => await instance.getUserBest({ u: username, limit: 100 }))(),
      ]);

      const bestScores = userBests.map((b) => ({
         id: b.beatmapId,
         score: b.score,
      }));

      const mapBestScores = mapBests.map((s) => s.score);

      return {
         id: user.id,
         pp: pp,
         date: formatDate(score.date),
         mods: formatMods(score.mods).mods,
         rankEmoji: `Rank${score.rank}`,
         score: formatNumber(getNumeric(score.score)),
         accuracy,
         maxCombo: score.maxCombo,
         counts: score.counts,
         progress: formatProgress(score, beatmap),
         pb: formatPB(score, beatmapId, bestScores),
         wr: formatWR(score, mapBestScores),
         beatmap: {
            url: `https://osu.ppy.sh/beatmaps/${beatmapId}`,
            name: beatmap.title,
            artist: beatmap.artist,
            thumbnail: `https://b.ppy.sh/thumb/${beatmap.beatmapset_id}l.jpg`,
            maxCombo: beatmap.max_combo,
            difficulty: beatmap.version,
            cs: beatmap.cs,
            ar: getAR(beatmap.ar, beatmapDifficulty, formattedMods.values),
            od: getOD(beatmap.od, beatmapDifficulty, formattedMods.values),
            hp: beatmap.hp,
            bpm: formatBPM(beatmap),
            duration: formatDuration(beatmap.total_length),
            approval: formatApproval(beatmap.approved),
            approvalDate: formatApprovalDate(beatmap.approved_date),
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
            name: `${beatmap.creator}`,
            avatar: `https://a.ppy.sh/${beatmap.creator_id}`,
         },
      };
   } catch (error) {
      console.error(error);
   }
};

export default { instance, getUserRecent, getUserBest, getUserBestBeatmap };
