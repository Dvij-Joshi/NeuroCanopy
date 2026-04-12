const fs = require('fs');
let code = fs.readFileSync('src/pages/Syllabus.tsx', 'utf8');

code = code.replace(/\\bselect\\\([\s\S]*?nodes:nodes\\(count\\)[\s\S]*?\\\\*?\\\)/g, \select('id, title, created_at, units(topics(count))')\);

code = code.replace(/topicCount: c\.nodes\?.\[0\]\?.count \|\| 0,/g, 'topicCount: (c.units || []).reduce((acc, u) => acc + (u.topics?.[0]?.count || 0), 0),');
code = code.replace(/\\\? Active \\\(\\.*c\.nodes\?.\[0\]\?.count \|\| 0\\} Topics\\)\\\/g, '\? Active (\\ Topics)\');

fs.writeFileSync('src/pages/Syllabus.tsx', code);
