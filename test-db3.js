import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
   const { data: c, error } = await supabase.from('courses').insert([{ 
       user_id: '00000000-0000-0000-0000-000000000000',
       title: 'Test Course',
       code: 'TEST101',
       color: '#ffffff'
   }]).select()
   console.log('course insert:', c, error)
}
test()
