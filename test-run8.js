import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: cols, error: e2 } = await supabase
        .from('nodes')
        .insert([{ user_id: 'fake', course_id: 'fake', title: 'fake' }])
        .select()
        
    console.log('insert error:', e2)
}
test()
