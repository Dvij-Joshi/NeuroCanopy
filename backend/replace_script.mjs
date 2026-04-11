import fs from 'fs';

let content = fs.readFileSync('E:/portfolio-projects/project-veda/v8/backend/server.js', 'utf8');

const badStart = "const prompt = You are a goal-oriented academic planner";
const goodStart = "const prompt = \You are a goal-oriented academic planner";

const badEnd = "\n  ]\n}\;"; // It might already have the closing backtick from my older script, wait no, my old script had } and ";.
content = content.replace(badStart, goodStart);

// Let's do a more robust regex:
content = content.replace(/const prompt = You are a goal-oriented academic planner([\s\S]*?)\]\n\};/g, "const prompt = \You are a goal-oriented academic planner\\]\n}\;");

fs.writeFileSync('E:/portfolio-projects/project-veda/v8/backend/server.js', content);
console.log("Fixed!");
