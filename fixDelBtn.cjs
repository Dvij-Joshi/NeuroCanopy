@\
const fs = require('fs');
let c = fs.readFileSync('src/pages/Syllabus.tsx', 'utf8');
c = c.replace(/if \\(selectedIds.size === 0 \\|\\| !user\\) return;/g, 'if (selectedIds.size === 0) return; if (!user) { alert(\\'Please login to delete.\\'); return; }');
fs.writeFileSync('src/pages/Syllabus.tsx', c);
\@
