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
