// ------------------------------------------------------------------
// Start and finish photos of each gym machine, so Mandy can spot the
// right one at the gym. From the free-exercise-db project
// (github.com/yuhonas/free-exercise-db), which releases them as public
// domain, though they appear to come from Bodybuilding.com. Fine for
// family TestFlight builds; swap them out before any App Store release.
// Keyed by the home move id the gym version stands in for.
// ------------------------------------------------------------------

export const GYM_PHOTOS: Record<string, [number, number]> = {
  'bent-row': [require('../../assets/gym/bent-row-0.jpg'), require('../../assets/gym/bent-row-1.jpg')],
  'single-row': [require('../../assets/gym/single-row-0.jpg'), require('../../assets/gym/single-row-1.jpg')],
  'lateral-raise': [require('../../assets/gym/lateral-raise-0.jpg'), require('../../assets/gym/lateral-raise-1.jpg')],
  'shoulder-press': [require('../../assets/gym/shoulder-press-0.jpg'), require('../../assets/gym/shoulder-press-1.jpg')],
  'reverse-fly': [require('../../assets/gym/reverse-fly-0.jpg'), require('../../assets/gym/reverse-fly-1.jpg')],
  'w-raise': [require('../../assets/gym/w-raise-0.jpg'), require('../../assets/gym/w-raise-1.jpg')],
  'biceps-curl': [require('../../assets/gym/biceps-curl-0.jpg'), require('../../assets/gym/biceps-curl-1.jpg')],
  'hammer-curl': [require('../../assets/gym/hammer-curl-0.jpg'), require('../../assets/gym/hammer-curl-1.jpg')],
  kickback: [require('../../assets/gym/kickback-0.jpg'), require('../../assets/gym/kickback-1.jpg')],
  'floor-press': [require('../../assets/gym/floor-press-0.jpg'), require('../../assets/gym/floor-press-1.jpg')],
  'floor-fly': [require('../../assets/gym/floor-fly-0.jpg'), require('../../assets/gym/floor-fly-1.jpg')],
  'close-press': [require('../../assets/gym/close-press-0.jpg'), require('../../assets/gym/close-press-1.jpg')],
  'goblet-squat': [require('../../assets/gym/goblet-squat-0.jpg'), require('../../assets/gym/goblet-squat-1.jpg')],
  'sumo-squat': [require('../../assets/gym/sumo-squat-0.jpg'), require('../../assets/gym/sumo-squat-1.jpg')],
  rdl: [require('../../assets/gym/rdl-0.jpg'), require('../../assets/gym/rdl-1.jpg')],
  'reverse-lunge': [require('../../assets/gym/reverse-lunge-0.jpg'), require('../../assets/gym/reverse-lunge-1.jpg')],
  'calf-raise': [require('../../assets/gym/calf-raise-0.jpg'), require('../../assets/gym/calf-raise-1.jpg')],
  'glute-bridge': [require('../../assets/gym/glute-bridge-0.jpg'), require('../../assets/gym/glute-bridge-1.jpg')],
};
