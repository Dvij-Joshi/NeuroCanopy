<<<<<<< HEAD
﻿import { createClient } from '@supabase/supabase-js'; const s = createClient('https://rbeithbyebylkpuqtfdq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWl0aGJ5ZWJ5bGtwdXF0ZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDI4ODAsImV4cCI6MjA4NzAxODg4MH0.UIxmoKiWxiU97jiu710LC9mMAHSzbyzo01JeG8Ho5l0'); s.from('topics').select('*').limit(1).then(res => console.log(JSON.stringify(res, null, 2)));
=======
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
   const { data: courses } = await supabase.from('courses').select('*').limit(1)
   const { data: materials } = await supabase.from('materials').select('*').limit(1)
   console.log('tables:', { hasCourses: !!courses, hasMaterials: !!materials })
}
test()
>>>>>>> my-local-backup
