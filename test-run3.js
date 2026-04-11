import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: n, error } = await supabase.from('materials').select('*').limit(3)
    console.log('materials:', n, error)
}
test()
