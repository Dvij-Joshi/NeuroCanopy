import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    // try to trigger an error by selecting a nonexistent column to see what it says
     const { data: n, error } = await supabase.from('nodes').select('nonexistent_col').limit(1)
     console.log('nodes schema error:', error)
}
test()
