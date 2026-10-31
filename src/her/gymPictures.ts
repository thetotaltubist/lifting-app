// ------------------------------------------------------------------
// Little line drawings of each gym machine, so Mandy can spot the right
// one at the gym. Drawn on a 100 x 80 grid with the floor at y = 76:
// `gear` is the machine (thin, quiet), `body` is her (thick, pink),
// `head` is the center of her head, and each arrow shows which way to move.
// Keyed by the home move id the gym version stands in for.
// ------------------------------------------------------------------

export type GymPicture = {
  gear: string[];
  body: string[];
  head: [number, number];
  arrows: [number, number, number, number][];
};

export const GYM_PICTURES: Record<string, GymPicture> = {
  // Seated cable row
  'bent-row': {
    gear: ['M16 60 H44 M22 60 V76 M38 60 V76', 'M88 8 V76 M82 76 H94', 'M66 48 V64', 'M38 46 H88'],
    body: ['M32 58 L33 35', 'M32 58 L49 50 L65 56', 'M33 37 L24 45 L38 46'],
    head: [34, 28],
    arrows: [[58, 38, 44, 38]],
  },
  // Lat pulldown
  'single-row': {
    gear: ['M16 6 V76 M10 76 H22', 'M16 6 H48', 'M47 6 V28', 'M40 28 H54', 'M28 58 H48 M38 58 V76', 'M52 48 H64'],
    body: ['M40 57 L37 35', 'M40 57 L57 54 L57 75', 'M37 37 L36 45 L47 29'],
    head: [35, 27],
    arrows: [[62, 12, 62, 26]],
  },
  // Cable lateral raise (from the front)
  'lateral-raise': {
    gear: ['M10 6 V76 M4 76 H16', 'M12 70 L72 27'],
    body: ['M50 24 V48', 'M42 24 H58', 'M50 48 L44 75 M50 48 L56 75', 'M42 24 L38 48', 'M58 24 L72 27'],
    head: [50, 15],
    arrows: [[82, 42, 82, 26]],
  },
  // Machine shoulder press
  'shoulder-press': {
    gear: ['M22 60 H48 M34 60 V76', 'M24 60 L20 22', 'M38 11 H50', 'M50 11 L64 11 M64 4 V76'],
    body: ['M30 58 L28 35', 'M30 58 L48 58 L48 75', 'M29 36 L38 24 L43 11'],
    head: [26, 27],
    arrows: [[56, 32, 56, 18]],
  },
  // Reverse pec deck (from behind)
  'reverse-fly': {
    gear: ['M50 6 V20', 'M38 60 H62', 'M14 24 V36 M86 24 V36'],
    body: ['M50 26 V56', 'M42 26 H58', 'M50 56 L42 62 L42 76 M50 56 L58 62 L58 76', 'M42 26 L28 30 L14 30', 'M58 26 L72 30 L86 30'],
    head: [50, 17],
    arrows: [[32, 44, 18, 44], [68, 44, 82, 44]],
  },
  // Overhead cable extension
  'w-raise': {
    gear: ['M10 6 V76 M4 76 H16', 'M12 24 L70 9'],
    body: ['M44 48 L50 26', 'M44 48 L36 75 M44 48 L54 75', 'M50 26 L60 16 L70 9'],
    head: [46, 18],
    arrows: [[74, 24, 82, 13]],
  },
  // Cable curl
  'biceps-curl': {
    gear: ['M90 6 V76 M84 76 H96', 'M53 30 L88 70', 'M53 25 V35'],
    body: ['M40 48 V24', 'M40 48 L35 75 M40 48 L46 75', 'M40 26 L42 39 L53 30'],
    head: [40, 15],
    arrows: [[66, 22, 58, 14]],
  },
  // Rope hammer curl
  'hammer-curl': {
    gear: ['M90 6 V76 M84 76 H96', 'M53 30 L88 70', 'M53 30 L50 37 M53 30 L57 36'],
    body: ['M40 48 V24', 'M40 48 L35 75 M40 48 L46 75', 'M40 26 L42 39 L53 30'],
    head: [40, 15],
    arrows: [[66, 22, 58, 14]],
  },
  // Triceps pushdown
  kickback: {
    gear: ['M72 6 V76 M66 76 H78', 'M72 6 H62', 'M62 6 L50 51', 'M44 51 H56'],
    body: ['M40 48 L42 24', 'M40 48 L35 75 M40 48 L46 75', 'M42 26 L42 39 L50 51'],
    head: [41, 15],
    arrows: [[60, 32, 60, 48]],
  },
  // Dumbbell bench press
  'floor-press': {
    gear: ['M16 58 H62 M24 58 V76 M56 58 V76', 'M30 28 H42 M30 23 V33 M42 23 V33'],
    body: ['M30 54 H56', 'M56 54 L69 60 L71 75', 'M34 54 L36 42 L36 28'],
    head: [23, 52],
    arrows: [[50, 46, 50, 30]],
  },
  // Pec deck (from the front)
  'floor-fly': {
    gear: ['M50 6 V20', 'M38 60 H62', 'M45 30 V42 M55 30 V42'],
    body: ['M50 26 V56', 'M42 26 H58', 'M50 56 L42 62 L42 76 M50 56 L58 62 L58 76', 'M42 26 L30 34 L45 36', 'M58 26 L70 34 L55 36'],
    head: [50, 17],
    arrows: [[18, 48, 32, 48], [82, 48, 68, 48]],
  },
  // Chest press machine
  'close-press': {
    gear: ['M18 60 H44 M30 60 V76', 'M20 60 L18 24', 'M54 31 V45', 'M54 38 H74 M74 8 V76'],
    body: ['M28 58 L26 35', 'M28 58 L46 58 L46 75', 'M26 37 L40 39 L54 38'],
    head: [25, 27],
    arrows: [[56, 24, 70, 24]],
  },
  // Leg press
  'goblet-squat': {
    gear: ['M12 38 L30 64 H44 M36 64 V76', 'M48 76 L92 32', 'M58 45 L72 59'],
    body: ['M38 62 L20 44', 'M38 62 L48 44 L64 52', 'M23 47 L30 58 L38 60'],
    head: [15, 37],
    arrows: [[74, 40, 84, 30]],
  },
  // Hip abduction machine (from the front)
  'sumo-squat': {
    gear: ['M34 52 H66', 'M28 50 V66 M72 50 V66'],
    body: ['M50 24 V50', 'M42 26 H58', 'M42 26 L36 44 L38 52', 'M58 26 L64 44 L62 52', 'M50 50 L32 58 L30 76', 'M50 50 L68 58 L70 76'],
    head: [50, 15],
    arrows: [[22, 58, 10, 58], [78, 58, 90, 58]],
  },
  // Seated leg curl
  rdl: {
    gear: ['M18 56 H46 M30 56 V76', 'M20 56 L17 24', 'M34 48 H50', 'M50 72 H60'],
    body: ['M26 54 L24 33', 'M26 54 L46 54 L54 68', 'M24 35 L32 44 L40 48'],
    head: [23, 25],
    arrows: [[66, 56, 60, 70]],
  },
  // Smith machine split squat
  'reverse-lunge': {
    gear: ['M80 4 V76 M74 76 H86', 'M36 25 H82'],
    body: ['M48 50 V27', 'M48 50 L62 56 L62 75', 'M48 50 L42 67 L28 74', 'M48 29 L55 35 L58 26'],
    head: [48, 17],
    arrows: [[90, 36, 90, 52]],
  },
  // Calf raise machine
  'calf-raise': {
    gear: ['M38 70 H62 V76', 'M38 22 H58', 'M58 22 H76 V76'],
    body: ['M48 46 V25', 'M48 46 L48 64 L54 70', 'M48 27 L41 34 L43 22'],
    head: [48, 14],
    arrows: [[28, 66, 28, 52]],
  },
  // Hip thrust machine
  'glute-bridge': {
    gear: ['M8 58 H28 M16 58 V76', 'M38 52 H54', 'M54 52 L72 30 V76'],
    body: ['M26 56 L46 58', 'M46 58 L60 60 L62 75', 'M28 57 L34 52 L40 52'],
    head: [19, 53],
    arrows: [[34, 46, 34, 34]],
  },
};
