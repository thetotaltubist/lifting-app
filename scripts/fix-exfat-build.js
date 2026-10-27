// The Seagate drive is formatted ExFAT, so macOS adds hidden "._" copies next
// to files. One Expo build script edits every .swiftinterface file it finds,
// trips over those "._" copies, and the iOS build fails. This makes it skip
// them. Runs automatically after `npm install`.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi', 'apple', 'scripts', 'build-xcframework.sh');
if (!fs.existsSync(file)) process.exit(0);

const before = `-name '*.swiftinterface')`;
const after = `-name '*.swiftinterface' ! -name '._*')`;
const text = fs.readFileSync(file, 'utf8');
if (text.includes(before)) fs.writeFileSync(file, text.split(before).join(after));
