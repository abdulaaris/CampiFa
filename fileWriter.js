const fs = require('fs');
const path = require('path');

module.exports = function write(relPath, content) {
  const target = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.trim() + '\n', 'utf8');
  console.log('Saved:', relPath);
};
