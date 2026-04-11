const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

const replacement = "const prompt = \You are a goal-oriented academic planner. Generate a topic schedule for the provided dates.\\n\\nNEW PHILOSOPHY:\\nDo NOT create a minute-by-minute daily routine (do not include wake up, sleep, meals, commute, or college events).\\nWe ONLY want to give the user 1 to 4 broad daily study goals (FOCUS or VIVA blocks) for their assigned topics, placed strictly in their FREE SLOTS.\\n\\nSTUDENT TIME BOUNDARIES & FREE SLOTS:\\n1. WAKE/SLEEP: Student wakes at \ and sleeps at \.\\n2. FREE SLOTS: \\\n3. CHRONOTYPE: \\\n\\nYOUR INSTRUCTIONS:\\n-> You MUST ONLY place blocks within the FREE SLOTS mentioned above! Do NOT place any blocks at 01:00 or 02:30 AM unless that happens to be in a free slot!\\n-> Use LOCAL time format: \\\"YYYY-MM-DDTHH:MM:00\\\" - NO \\\"Z\\\" suffix.\\n-> ONLY use categories: \\\"FOCUS\\\" or \\\"VIVA\\\".\\n-> Each block should be around 1 to 2 hours long.\\n-> Keep it simple and minimal. Just 1 to 4 events max per day.\\n\\nDATES TO CONSIDER:\\n\\\n\\nTOPIC ASSIGNMENTS FOR EACH DATE:\\n\\\n\\nReturn ONLY this JSON (no markdown, no explanation):\\n{\\n  \\\"events\\\": [\\n    {\\\"title\\\":\\\"Study: OS Memory\\\",\\\"category\\\":\\\"FOCUS\\\",\\\"start_time\\\":\\\"2026-04-11T18:00:00\\\",\\\"end_time\\\":\\\"2026-04-11T19:30:00\\\",\\\"topic_id\\\":\\\"exact-uuid-from-distribution\\\"}\\n  ]\\n}\;";

code = code.replace(/const prompt = You are a goal-oriented academic planner\.[\s\S]*?\]\n\};/, replacement);

// Post processing filter injection
const preProcessFilter = "const cleanedEvents = parsedResponse.events.map(e => ({\\n      ...e,\\n      topic_id: e.topic_id && validTopicIds.has(e.topic_id) ? e.topic_id : null,\\n    }));";

const postProcessFilter = preProcessFilter + "\n\n    const timeToMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };\n    const wM = timeToMins(p.waketime || '07:00');\n    let sM = timeToMins(p.sleeptime || '23:00');\n    if (sM < wM) sM += 24 * 60;\n\n    const filteredEvents = cleanedEvents.filter(e => {\n      if (!e.start_time) return false;\n      const d = new Date(e.start_time);\n      const eventMins = d.getHours() * 60 + d.getMinutes();\n      let eM = eventMins;\n      if (eM < wM) eM += 24 * 60; // if event is past midnight, push it to next day hours\n      \n      if (eM >= wM && eM <= sM) return true; // valid if within wake->sleep window\n      return false;\n    });\n    console.log([Validation Filter] Groq sent \ events. Filtered down to \ valid events.);\n\n    res.json({ events: filteredEvents });\n";

code = code.replace(preProcessFilter + "\\n\\n    res.json({ events: cleanedEvents });", postProcessFilter);
// Fallback if previous replacement of preProcess doesn't match spacing:
code = code.replace(/res\.json\(\{\s*events:\s*cleanedEvents\s*\}\);/, "res.json({ events: filteredEvents });");

fs.writeFileSync('backend/server.js', code);
