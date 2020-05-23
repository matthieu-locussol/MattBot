import * as fs from 'fs';
import * as osu from 'ojsama';
import * as readline from 'readline';
import { Chart } from 'chart.js';
import { CanvasRenderService } from 'chartjs-node-canvas';

const CHART_WIDTH = 299;
const CHART_HEIGHT = 40;
const CHART_STRAINS = 100;
const CHART_FILENAME = 'src/data/chart.png';

const parser = new osu.parser();

const average = (array: any[]) => array.reduce((p, c) => p + c, 0) / array.length;

const parseArgs = (argv: string[]) => {
   let args = {
      mods: 0,
      acc_percent: undefined,
      combo: undefined,
      nmiss: undefined,
   };

   for (let i = 2; i < argv.length; ++i) {
      if (argv[i].startsWith('+')) {
         args.mods = osu.modbits.from_string(argv[i].slice(1) || '');
      } else if (argv[i].endsWith('%')) {
         args.acc_percent = parseFloat(argv[i]);
      } else if (argv[i].endsWith('x')) {
         args.combo = parseInt(argv[i]);
      } else if (argv[i].endsWith('m')) {
         args.nmiss = parseInt(argv[i]);
      }
   }

   return args;
};

const generateChart = (difficulty: osu.std_diff) => {
   const data = difficulty.objects.map((o: osu.std_diff_hitobject) => o.strains);

   const strains_max = CHART_STRAINS < data.length ? CHART_STRAINS : data.length;
   const strains_length = data.length;
   const step = strains_length / strains_max || 1;

   const averages = [];
   for (let i = 0; i < strains_max; ++i) {
      // Slice of strains to sum
      const slice = data.slice(i * step, (i + 1) * step);
      // Average of speed + aim
      const perfs = slice.map((e) => (e[0] + e[1]) / 2);

      averages.push(average(perfs));
   }

   const configuration: Chart.ChartConfiguration = {
      type: 'line',
      data: {
         labels: averages.map(() => ''),
         datasets: [
            {
               data: averages,
               borderWidth: 1,
               borderColor: 'rgba(255, 107, 129, 1)',
               backgroundColor: 'rgba(255, 107, 129, 0.4)',
            },
         ],
      },
      options: {
         scales: {
            yAxes: [
               {
                  ticks: {
                     max: Math.max(...averages),
                  },
               },
            ],
         },
      },
   };

   const canvas = new CanvasRenderService(CHART_WIDTH, CHART_HEIGHT, (chart: typeof Chart) => {
      chart.defaults.scale.display = false;
      chart.defaults.global.legend.display = false;
      chart.defaults.global.elements.point.radius = 0;
   });

   fs.writeFileSync(CHART_FILENAME, canvas.renderToBufferSync(configuration));
};

readline
   .createInterface({
      input: process.stdin,
      terminal: false,
   })
   .on('line', parser.feed_line.bind(parser))
   .on('close', () => {
      const { mods, acc_percent, combo, nmiss } = parseArgs(process.argv);

      const map = parser.map;
      const stars = new osu.diff().calc({ map: map, mods: mods });
      const pp = osu.ppv2({ stars, combo, nmiss, acc_percent });

      const starsResult = stars.toString().split(' ')[0];
      // @ts-ignore
      const accResult = pp.computed_accuracy.toString().split(' ')[0];
      const ppResult = Math.round(pp.total * 100) / 100;

      generateChart(stars);

      process.stdout.write(`${starsResult} ${accResult} ${ppResult}`);
   });
