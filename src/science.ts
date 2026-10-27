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
    title: 'Rest between sets',
    strength: 'Moderate',
    body:
      'Resting 2 minutes or more on big lifts lets you keep your reps up, which adds up to more growth than short rest. For isolation work, rest beyond about 90 seconds adds little. The timer suggests 3 minutes for heavy compounds, 2:30 for other compounds and 1:30 for isolation, adding 30 seconds after a set to failure.',
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
    title: 'Rate of weight loss',
    strength: 'Moderate',
    body:
      'Losing about 0.5 to 1% of body weight a week keeps more muscle than losing faster. The Body tab tracks your 7-day average from Apple Health. Above 1% a week, the app tells you to eat more and pauses catch-up sets.',
  },
  {
    title: 'Sleep',
    strength: 'Moderate',
    body:
      'One short night barely affects lifting. Several in a row lower performance and recovery. After 3 nights under 6 hours, the app skips catch-up sets. Your normal workout stays the same.',
  },
  {
    title: 'HRV and resting heart rate',
    strength: 'Emerging',
    body:
      'HRV-guided training mostly helps endurance athletes. For lifting, the studies are few and small, and your own performance is a better guide. The app shows these numbers but never changes your workout because of them.',
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
  'Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. J Int Soc Sports Nutr. 2014;11:20.',
  'Garthe I, Raastad T, Refsnes PE, Koivisto A, Sundgot-Borgen J. Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes. Int J Sport Nutr Exerc Metab. 2011;21(2):97-104.',
  'Knowles OE, Drinkwater EJ, Urwin CS, Lamon S, Aisbett B. Inadequate sleep and muscle strength: implications for resistance training. J Sci Med Sport. 2018;21(9):959-968.',
  'Kiviniemi AM, Hautala AJ, Kinnunen H, Tulppo MP. Endurance training guided individually by daily heart rate variability measurements. Eur J Appl Physiol. 2007;101(6):743-751.',
  'Schoenfeld BJ, Pope ZK, Benik FM, et al. Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men. J Strength Cond Res. 2016;30(7):1805-1812.',
  'Grgic J, Lazinica B, Mikulic P, Krieger JW, Schoenfeld BJ. The effects of short versus long inter-set rest intervals in resistance training on measures of muscle hypertrophy: a systematic review. Eur J Sport Sci. 2017;17(8):983-993.',
  'Morton RW, Murphy KT, McKellar SR, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength. Br J Sports Med. 2018;52(6):376-384.',
];
