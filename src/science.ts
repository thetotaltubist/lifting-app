// ------------------------------------------------------------------
// The reasoning behind the plan, shown on "How the plan works".
// Every reference is a real, published paper (or a preprint, marked).
// ------------------------------------------------------------------

export const SCIENCE: { title: string; body: string; strength: 'Strong' | 'Moderate' | 'Emerging' }[] = [
  {
    title: 'Weekly sets per muscle',
    strength: 'Strong',
    body:
      'More weekly hard sets build more muscle, but each extra set adds less than the one before. Around 10+ sets a week per muscle is a good working range for trained lifters. The app ramps each muscle from the low end of its range to the peak over 4 weeks instead of starting at the top.',
  },
  {
    title: 'Holding muscle in a cut',
    strength: 'Moderate',
    body:
      'Muscle and strength can be kept on roughly a third of normal training volume, as long as the weights stay heavy. A calorie deficit also blunts muscle gain, so extra sets buy less. That is why Cut mode uses lower targets and keeps you lifting heavy.',
  },
  {
    title: 'Counting helper muscles as half',
    strength: 'Moderate',
    body:
      'A press works triceps too, but less than a pushdown. Counting each set as half for helper muscles predicts growth better than counting it as zero or as a full set. It is still an estimate.',
  },
  {
    title: 'How often to train a muscle',
    strength: 'Moderate',
    body:
      'Training a muscle about twice a week works at least as well as once. Beyond that, total weekly sets matter more than how they are split up. Your rotation hits each muscle about 1.7 times a week at 5 sessions.',
  },
  {
    title: 'Catch-up and the per-session limit',
    strength: 'Emerging',
    body:
      'Piling all of a missed week into one workout is not as useful as it looks: past roughly 6 to 11 sets for one muscle in one session, extra sets seem to do little. That is the least settled finding here. So catch-up adds at most 3 sets per muscle per session (10 total at most) and spreads the rest over the next sessions.',
  },
  {
    title: 'How close to failure',
    strength: 'Moderate',
    body:
      'Sets need to be hard, but going all the way to failure adds little muscle and costs more fatigue. The app starts each block 2 to 3 reps short of failure on big lifts and moves closer as the block goes on. Isolation work can go closer.',
  },
  {
    title: 'Rep ranges',
    strength: 'Strong',
    body:
      'Muscle grows across a wide range of reps (about 5 to 30) as long as sets are close to failure. The app uses 6 to 12 for presses, rows and squats, and higher reps for isolation work, which is easier on joints.',
  },
  {
    title: 'Progression',
    strength: 'Strong',
    body:
      'Double progression: keep the weight until every set hits the top of the rep range, then add weight and start at the bottom. In a cut, holding your weights is a win. The app flags a stall only after 3 sessions without progress.',
  },
  {
    title: 'Deloads',
    strength: 'Emerging',
    body:
      'A scheduled deload week did not add muscle in a controlled trial, so the app does not force one. It suggests one when several lifts stall or the block runs long, and you decide.',
  },
  {
    title: 'Protein',
    strength: 'Strong',
    body: 'About 1.6 g per kg a day (around 160 g for you) covers most of the benefit, and more is fine. This matters more on tirzepatide, which cuts appetite.',
  },
];

export const REFERENCES = [
  'Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sci. 2017;35(11):1073-1082.',
  'Pelland JC, Remmert JF, Robinson ZP, et al. The resistance training dose response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gain. SportRxiv preprint, 2024.',
  'Bickel CS, Cross JM, Bamman MM. Exercise dosing to retain resistance training adaptations in young and older adults. Med Sci Sports Exerc. 2011;43(7):1177-1187.',
  'Spiering BA, Mujika I, Sharp MA, Foulis SA. Maintaining physical performance: the minimal dose of exercise needed to preserve endurance and strength over time. J Strength Cond Res. 2021;35(5):1449-1458.',
  'Murphy C, Koehler K. Energy deficiency impairs resistance training gains in lean mass but not strength: a meta-analysis and meta-regression. Scand J Med Sci Sports. 2022;32(1):125-137.',
  'Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis. Sports Med. 2016;46(11):1689-1697.',
  'Schoenfeld BJ, Grgic J, Krieger J. How many times per week should a muscle be trained to maximize muscle hypertrophy? J Sports Sci. 2019;37(11):1286-1295.',
  'Refalo MC, Helms ER, Trexler ET, Hamilton DL, Fyfe JJ. Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic review with meta-analysis. Sports Med. 2023;53(3):649-665.',
  'Schoenfeld BJ, Grgic J, Van Every DW, Plotkin DL. Loading recommendations for muscle strength, hypertrophy, and local endurance: a re-examination of the repetition continuum. Sports. 2021;9(2):32.',
  'Coleman M, Burke R, Augustin F, et al. Gaining more from doing less? The effects of a one-week deload period during supervised resistance training on muscular adaptations. PeerJ. 2024;12:e16777.',
  'Morton RW, Murphy KT, McKellar SR, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength. Br J Sports Med. 2018;52(6):376-384.',
];
