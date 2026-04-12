import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: n, error } = await supabase.from('nodes').select('*').limit(1)
    
     const { data: cols, error: e2 } = await supabase
        .rpc('get_columns', { p_table_name: 'nodes' })
     
     console.log('rpc get columns:', cols, e2)
}
test()
