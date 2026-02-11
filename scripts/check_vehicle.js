
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Using anon key, so RLS applies. If we had service role we could bypass.
// checking if service role is available in env
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey);

async function checkVehicle() {
  const id = '350b0961-1c8d-4674-a419-184d817e128b';
  console.log(`Checking vehicle ${id}...`);

  // Try to fetch with unrestricted query if service role key is present, otherwise RLS applies
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('Vehicle NOT found via ' + (serviceRoleKey ? 'Service Role' : 'Anon Key'));
  } else {
    console.log('Vehicle found:');
    console.log(data[0]);
  }
}

checkVehicle();
