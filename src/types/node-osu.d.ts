declare module 'node-osu' {
   /**
    * An enum of mods with their bitwise representation
    * @readonly
    * @enum {Number}
    */
   export enum Mods {
      'None' = 0,
      'NoFail' = 1,
      'Easy' = 1 << 1,
      'TouchDevice' = 1 << 2,
      'Hidden' = 1 << 3,
      'HardRock' = 1 << 4,
      'SuddenDeath' = 1 << 5,
      'DoubleTime' = 1 << 6,
      'Relax' = 1 << 7,
      'HalfTime' = 1 << 8,
      'Nightcore' = 1 << 9, // DoubleTime mod
      'Flashlight' = 1 << 10,
      'Autoplay' = 1 << 11,
      'SpunOut' = 1 << 12,
      'Relax2' = 1 << 13, // Autopilot
      'Perfect' = 1 << 14, // SuddenDeath mod
      'Key4' = 1 << 15,
      'Key5' = 1 << 16,
      'Key6' = 1 << 17,
      'Key7' = 1 << 18,
      'Key8' = 1 << 19,
      'FadeIn' = 1 << 20,
      'Random' = 1 << 21,
      'Cinema' = 1 << 22,
      'Target' = 1 << 23,
      'Key9' = 1 << 24,
      'KeyCoop' = 1 << 25,
      'Key1' = 1 << 26,
      'Key3' = 1 << 27,
      'Key2' = 1 << 28,
      'KeyMod' = 521109504,
      'FreeModAllowed' = 522171579,
      'ScoreIncreaseMods' = 1049662,
   }
   export class Beatmap {
      public id: string;
      public beatmapSetId: string;
      public hash: string;
      public title: string;
      public creator: string;
      public version: string;
      public source: string;
      public artist: string;
      public genre: string;
      public language: string;
      public rating: string | number;
      public bpm: string | number;
      public mode: string;
      public tags: string[];
      public approvalStatus: string;
      public raw_submitDate: string;
      public raw_approvedDate: string;
      public raw_lastUpdate: string;
      public maxCombo: string | number;
      public objects: BeatmapObjects;
      public difficulty: BeatmapDifficulty;
      public length: BeatmapLength;
      public counts: BeatmapCounts;
      public hasDownload: Boolean;
      public hasAudio: Boolean;
      public submitDate: Date;
      public approvedDate: Date;
      public lastUpdate: Date;
   }
   export class Event {
      public html: string;
      public beatmapId: string;
      public beatmapSetId: string;
      public raw_date: string;
      public epicFactor: string | number;
      public date: Date;
   }
   export class Game {
      public id: string;
      public raw_start: string;
      public raw_end: string;
      public beatmapId: string;
      public mode: string;
      public matchType: '0';
      public scoringType: string;
      public teamType: string;
      public raw_mods: number;
      public scores: MultiplayerScore[];
      public start: Date;
      public end: Date;
      public mods: string[];
   }
   export class Match {
      public id: string;
      public name: string;
      public raw_start: string;
      public raw_end: string;
      public games: Game[];
      public start: Date;
      public end: Date;
   }
   export class MultiplayerScore {
      public slot: string | number;
      public team: string;
      public userId: string;
      public score: string | number;
      public maxCombo: string | number;
      public rank: null;
      public counts: MultiplayerScoreCounts;
      public perfect: boolean;
      public pass: boolean;
      public raw_mods: number;
      public mods: string[];
   }
   export class Score {
      public score: string | number;
      public user: ScoreUser;
      public beatmapId: string;
      public counts: ScoreCounts;
      public maxCombo: string | number;
      public perfect: boolean;
      public raw_date: string;
      public rank: string;
      public pp: string | number;
      public hasReplay: boolean;
      public raw_mods: number;
      public beatmap: Beatmap;
      public date: Date;
      public mods: string[];
      public accuracy: number | undefined;
   }
   export class User {
      public id: string;
      public name: string;
      public counts: UserCounts;
      public scores: UserScores;
      public pp: UserPP;
      public country: string;
      public level: string | number;
      public accuracy: string | number;
      public secondsPlayed: string | number;
      public raw_joinDate: string;
      public events: Event[];
      public accuracyFormatted: string;
      public joinDate: Date;
   }

   export class Api {
      public config: ApiOptions;

      /**
       * Creates a new node-osu object
       * @param apiKey Your osu api key
       * @param options API options
       */
      constructor(apiKey: string, options?: ApiOptions);

      // apiCall(endpoint: string, options: ApiCallOptions): Promise<any>;

      /**
       * Returns an array of Beatmap objects
       * @param options API options for Beatmaps
       */
      getBeatmaps(options: ApiOptionsBeatmaps): Promise<Beatmap[]>;
      /**
       * Returns an User object
       * @param options API options for User
       */
      getUser(options: ApiOptionsUser): Promise<User>;
      /**
       * Returns an array of Score objects
       * @param options API options for Scores
       */
      getScores(options: ApiOptionsScores): Promise<Score[]>;
      /**
       * Returns an array of Score objects
       * @param options API options for UserBest
       */
      getUserBest(options: ApiOptionsUserBest): Promise<Score[]>;
      /**
       * Returns an array of Score objects.
       * Will return not found if the user has not submitted any scores in the past 24 hours
       * @param options API options for UserRecent
       */
      getUserRecent(options: ApiOptionsUserRecent): Promise<Score[]>;
      /**
       * Returns a Match object.
       * @param options API options for Match
       */
      getMatch(options: ApiOptionsMatch): Promise<Match>;
      /**
       * Returns a Replay object. **Do not spam this endpoint.**
       * @param options API options for Replay
       */
      getReplay(options: ApiOptionsReplay): any;
   }

   export interface MultiplayerScoreCounts {
      300: string | number;
      100: string | number;
      50: string | number;
      geki: string | number;
      katu: string | number;
      miss: string | number;
   }

   export interface UserPP {
      raw: string | number;
      rank: string | number;
      countryRank: string | number;
   }

   export interface UserScores {
      ranked: string | number;
      total: string | number;
   }

   export interface UserCounts {
      300: string | number;
      100: string | number;
      50: string | number;
      SSH: string | number;
      SS: string | number;
      SH: string | number;
      S: string | number;
      A: string | number;
      plays: string | number;
   }

   export interface ScoreCounts {
      300: string | number;
      100: string | number;
      50: string | number;
      geki: string | number;
      katu: string | number;
      miss: string | number;
   }

   export interface ScoreUser {
      id: string;
      name?: string;
   }

   export interface BeatmapCounts {
      favorites: string | number;
      favourites: string | number;
      plays: string | number;
      passes: string | number;
   }

   export interface BeatmapLength {
      total: string | number;
      drain: string | number;
   }

   export interface BeatmapDifficulty {
      rating: string | number;
      aim: string | number;
      speed: string | number;
      size: string | number;
      overall: string | number;
      approach: string | number;
      drain: string | number;
   }

   export interface BeatmapObjects {
      normal: string | number;
      slider: string | number;
      spinner: string | number;
   }

   export interface ApiOptionsReplay {
      /** Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania) */
      m: 0 | 1 | 2 | 3;
      /** The beatmapId in which the replay was played */
      b: string;
      /** The user that has played the beatmap (required) */
      u: string;
      /** Specify if u is a userId or a username */
      type?: 'string' | 'id';
      /** Specify a mod or mod combination */
      mods?: number;
   }

   export interface ApiOptionsMatch {
      /** Match id to get information from */
      mp: string;
   }

   export interface ApiOptionsUserRecent {
      /** Specify a userId or a username to return recent plays from */
      u: string;
      /** Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania) */
      m?: 0 | 1 | 2 | 3;
      /** Specify if `u` is a user_id or a username */
      type?: 'string' | 'id';
      /** Amount of results (range between 1 and 50 - defaults to 10) */
      limit?: number;
   }

   export interface ApiOptionsUserBest {
      /** Specify a userId or a username to return best scores from */
      u: string;
      /** Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania) */
      m?: 0 | 1 | 2 | 3;
      /** Specify if u is a user_id or a username */
      type?: 'string' | 'id';
      /** Amount of results (range between 1 and 100 - defaults to 10) */
      limit?: number;
   }

   export interface ApiOptionsScores {
      /** Specify a beatmapId to return score information from */
      b: string;
      /** Specify a userId or a username to return information for */
      u?: string;
      /** Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania) */
      m?: 0 | 1 | 2 | 3;
      /** Specify if u is a user_id or a username */
      type?: 'string' | 'id';
      /** Amount of results from the top (range between 1 and 100 - defaults to 50) */
      limit?: number;
   }

   export interface ApiOptionsUser {
      /** Specify a userId or a username to return metadata from */
      u: string;
      /** Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania) */
      m?: 0 | 1 | 2 | 3;
      /** Specify if u is a user_id or a username */
      type?: 'string' | 'id';
      /** Max number of days between now and last event date. Range of 1-31. Default value is 1 */
      event_days?: number;
   }

   export interface ApiOptionsBeatmaps {
      /** Specify a beatmapId to return metadata from */
      b: string;
      /** Return all beatmaps ranked or loved since this date */
      since?: Date;
      /** Specify a beatmapSetId to return metadata from */
      s?: string;
      /** Specify a userId or a username to return metadata from */
      u?: string;
      /** Specify if `u` is a userId or a username */
      type?: 'string' | 'id';
      /** Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania) */
      m?: 0 | 1 | 2 | 3;
      /** Specify whether converted beatmaps are included */
      a?: 0 | 1;
      /** The beatmap hash */
      h?: string;
      /** Amount of results. Default and maximum are 500 */
      limit?: number;
      /** Mods that apply to the beatmap requested. Default is 0 */
      mods?: number;
   }

   export interface ApiOptions {
      /** Sets the base api url */
      baseUrl?: string;
      /** Throw an error on not found instead of returning nothing */
      notFoundAsError?: boolean;
      /** When fetching scores also fetch the beatmap they are for (Allows getting accuracy) */
      completeScores?: boolean;
      /** Parse numeric properties into numbers. May have overflow */
      parseNumeric?: boolean;
   }

   export const URLSchemas: {
      /** Joins a multiplayer match */
      multiplayerMatch: (id: string, password: undefined | string) => string;
      /** Links to a certain part of a map in the editor */
      edit: (position: string, objects: undefined | string) => string;
      /** Joins a chat channel */
      channel: (name: string) => string;
      /** Downloads a beatmap in the game */
      download: (id: string) => string;
      /** Spectates a player */
      spectate: (user: string) => string;
   };

   /** Enums for beatmaps */
   export const Beatmaps: {
      /**
       * Approval states
       * @readonly
       * @enum {String}
       */
      approved: {
         '-2': 'Graveyard';
         '-1': 'WIP';
         '0': 'Pending';
         '1': 'Ranked';
         '2': 'Approved';
         '3': 'Qualified';
         '4': 'Loved';
      };
      /**
       * Song genres
       * @readonly
       * @enum {String}
       */
      genre: {
         '0': 'Any';
         '1': 'Unspecified';
         '2': 'Video Game';
         '3': 'Anime';
         '4': 'Rock';
         '5': 'Pop';
         '6': 'Other';
         '7': 'Novelty';
         '9': 'Hip Hop';
         '10': 'Electronic';
      };
      /**
       * Song languages
       * @readonly
       * @enum {String}
       */
      language: {
         '0': 'Any';
         '1': 'Other';
         '2': 'English';
         '3': 'Japanese';
         '4': 'Chinese';
         '5': 'Instrumental';
         '6': 'Korean';
         '7': 'French';
         '8': 'German';
         '9': 'Swedish';
         '10': 'Spanish';
         '11': 'Italian';
      };
      /**
       * Game modes
       * @readonly
       * @enum {String}
       */
      mode: {
         '0': 'Standard';
         '1': 'Taiko';
         '2': 'Catch the Beat';
         '3': 'Mania';
      };
   };

   /** Enums for multiplayer matches */
   export const Multiplayer: {
      /**
       * Scoring types
       * @readonly
       * @enum {String}
       */
      scoringType: {
         '0': 'Score';
         '1': 'Accuracy';
         '2': 'Combo';
         '3': 'Score v2';
      };
      /**
       * Team setup
       * @readonly
       * @enum {String}
       */
      teamType: {
         '0': 'Head to Head';
         '1': 'Tag Co-op';
         '2': 'Team vs';
         '3': 'Tag Team vs';
      };
      /**
       * Team of a player
       * @readonly
       * @enum {String}
       */
      team: {
         '0': 'None';
         '1': 'Blue';
         '2': 'Red';
      };
   };

   /** Methods to calculate accuracy based on the game mode */
   export const AccuracyMethods: {
      /**
       * Calculates accuracy based on hit counts for standard games
       * @param {MultiplayerScoreCounts} c Hit counts
       */
      Standard: (c: MultiplayerScoreCounts) => number;
      /**
       * Calculates accuracy based on hit counts for taiko games
       * @param {MultiplayerScoreCounts} c Hit counts
       */
      Taiko: (c: MultiplayerScoreCounts) => number;
      /**
       * Calculates accuracy based on hit counts for CtB games
       * @param {MultiplayerScoreCounts} c Hit counts
       */
      'Catch the Beat': (c: MultiplayerScoreCounts) => number;
      /**
       * Calculates accuracy based on hit counts for mania games
       * @param {MultiplayerScoreCounts} c Hit counts
       */
      Mania: (c: MultiplayerScoreCounts) => number;
   };
}
