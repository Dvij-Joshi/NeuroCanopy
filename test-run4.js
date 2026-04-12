import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: n, error } = await supabase.rpc('get_schema_info')
    console.log('rpc:', n, error)
    
    // Fallback: try to insert a fake nodes row to see required columns
     const { data: n2, error: e2 } = await supabase.from('nodes').insert([{}]).select()
     console.log('nodes insert:', n2, e2)
}
test()
