import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
   const { data: c } = await supabase.from('courses').select('*').limit(1)
   console.log('course cols:', c && c.length > 0 ? Object.keys(c[0]) : c)
}
test()
