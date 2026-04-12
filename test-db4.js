import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
async function t() {
  const { data } = await supabase.from('courses').select('id, title, units(id, topics(id))').limit(10);
  console.log(JSON.stringify(data, null, 2));
}
t();
