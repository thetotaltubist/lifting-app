// The Seagate drive is formatted ExFAT, so macOS adds hidden "._" copies next
// to files, and the drive is slow. This works around both in Expo's build
// scripts. Runs automatically after `npm install`.
const fs = require('fs');
const path = require('path');

function patch(relative, before, after) {
  const file = path.join(__dirname, '..', 'node_modules', ...relative.split('/'));
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(before)) fs.writeFileSync(file, text.split(before).join(after));
}

// One build script edits every .swiftinterface file it finds and trips over
// the "._" copies. Make it skip them.
patch(
  'expo-modules-jsi/apple/scripts/build-xcframework.sh',
  `-name '*.swiftinterface')`,
  `-name '*.swiftinterface' ! -name '._*')`
);

// The scan for native modules gives up after 5 seconds, which the drive can't
// make. Give it 2 minutes.
patch('expo-modules-autolinking/build/platforms/apple/moduleScanner.js', 'timeout: 5000', 'timeout: 120000');
