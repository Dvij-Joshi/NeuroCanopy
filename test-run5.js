import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: n, error } = await supabase.from('nodes').select('*')
    // Get columns by doing an empty select with count
    const { data: d, error: e } = await supabase.from('nodes').select('*').limit(1)
    console.log('nodes length:', n?.length, 'cols:', d && d.length > 0 ? Object.keys(d[0]) : 'no data')
}
test()
