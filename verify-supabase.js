require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('Testing connection...');
        const { data, error } = await supabase.from('members').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            console.error('Error details:', error);
        } else {
            console.log('Connection successful!');
        }
    } catch (err) {
        console.error('Exception:', err.message);
    }
}

testConnection();
