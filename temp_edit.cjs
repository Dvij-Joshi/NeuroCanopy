const fs = require('fs');
let code = fs.readFileSync('src/pages/Syllabus.tsx', 'utf8');

const s1 = code.indexOf('// Comparison Logic: Check if Course (Subject) already exists');
const s2 = code.indexOf('if (existingCourses && existingCourses.length > 0) {');

if(s1 > -1 && s2 > -1){
    const oldStr = code.substring(s1, s2 + 'if (existingCourses && existingCourses.length > 0) {'.length);
    const newStr = "// Comparison Logic: Check if Course (Subject) already exists\n" +
"      let courseId;\n" +
"      let newTopicsCount = 0;\n" +
"      let isExistingCourse = false;\n\n" +
"      if (targetCourseId !== 'auto') {\n" +
"         courseId = targetCourseId;\n" +
"         isExistingCourse = true;\n" +
"      } else {\n" +
"         const { data: existingCourses } = await supabase\n" +
"           .from('courses')\n" +
"           .select('*')\n" +
"           .eq('user_id', user.id)\n" +
"           .ilike('title', courseTitle);\n\n" +
"         if (existingCourses && existingCourses.length > 0) {\n" +
"             courseId = existingCourses[0].id;\n" +
"             isExistingCourse = true;\n" +
"         }\n" +
"      }\n\n" +
"      if (isExistingCourse) {";
    code = code.replace(oldStr, newStr);
}

const hdrOld = "        <button \n          onClick={handleUploadClick}\n          className=\"btn-brutal bg-black text-white flex items-center gap-2 hover:bg-gray-900 transition-colors\"\n        >\n          <Upload strokeWidth={3} /> Upload File\n        </button>";
const hdrNew = '        <div className="flex gap-2 items-center flex-wrap justify-end">\n          <select \n             value={targetCourseId}\n             onChange={(e) => setTargetCourseId(e.target.value)}\n             className="border-2 border-black p-2 font-bold text-sm bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"\n          >\n            <option value="auto">Auto-Detect / New Subject</option>\n            {materials.filter(m => !m.isUploading).map(m => (\n              <option key={m.id} value={m.id}>{m.title}</option>\n            ))}\n          </select>\n          <button \n            onClick={handleUploadClick}\n            className="btn-brutal bg-black text-white flex items-center gap-2 hover:bg-gray-900 transition-colors"\n          >\n            <Upload strokeWidth={3} /> Upload File\n          </button>\n        </div>';

code = code.replace(hdrOld, hdrNew);

fs.writeFileSync('src/pages/Syllabus.tsx', code);
