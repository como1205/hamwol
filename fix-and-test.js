const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('Error: .env.local file not found.');
            process.exit(1);
        }

        const buffer = fs.readFileSync(envPath);
        let content = '';

        // Detect encoding
        if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
            console.log('Encoding: UTF-16 LE (Detected)');
            content = buffer.toString('utf16le');
        } else {
            console.log('Encoding: UTF-8 (Assumed)');
            content = buffer.toString('utf8');
        }

        // Sanitize content
        content = content.replace(/^\uFEFF/, ''); // Remove BOM
        content = content.replace(/\0/g, ''); // Remove nulls

        const envVars = {};
        content.split(/\r?\n/).forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^["'](.*)["']$/, '$1');
                if (key) envVars[key] = value;
            }
        });

        const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
        const key = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        console.log(`Parsed URL: ${url ? url.substring(0, 15) + '...' : 'Not Found'}`);
        console.log(`Parsed Key: ${key ? key.substring(0, 5) + '...' : 'Not Found'}`);

        if (!url || !url.startsWith('https://')) {
            console.error('Error: Invalid or missing Supabase URL. It should start with https://');
            process.exit(1);
        }
        if (!key) {
            console.error('Error: Missing Supabase Key.');
            process.exit(1);
        }

        // Save as UTF-8
        const newContent = `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${key}\n`;
        fs.writeFileSync(envPath, newContent, 'utf8');
        console.log('File saved as UTF-8.');

        // Test Connection
        console.log('Connecting to Supabase...');
        const supabase = createClient(url, key);
        const { data, error } = await supabase.from('bylaws').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection Failed:', error.message);
            process.exit(1);
        }

        console.log('SUCCESS: Connection verified.');

    } catch (err) {
        console.error('Script Error:', err);
        process.exit(1);
    }
}

main();
