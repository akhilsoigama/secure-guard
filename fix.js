const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      const old = content;
      content = content.replace(/Severity\.(CRITICAL|HIGH|MEDIUM|LOW|INFO)/g, "'$1'");
      content = content.replace(/^\s*column:\s*[^,]+,\r?\n/gm, '');
      content = content.replace(/^\s*metadata:\s*[^,]+,\r?\n/gm, '');
      if (old !== content) {
        fs.writeFileSync(full, content);
        console.log('Fixed', full);
      }
    }
  }
}

walk('e:/secure-guard/packages/scanner/src');
