const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(__dirname, '.env.local');
    console.log('Reading file:', envPath);

    if (!fs.existsSync(envPath)) {
        console.error('File does not exist.');
        process.exit(1);
    }

    const content = fs.readFileSync(envPath, 'utf8');
    console.log('File size:', content.length, 'bytes');

    console.log('--- File Content Preview ---');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        // Print the key part and mask the value
        const parts = line.split('=');
        if (parts.length > 1) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            const maskedVal = val.substring(0, 5) + '...';
            console.log(`Line ${index + 1}: ${key}=${maskedVal}`);
        } else {
            console.log(`Line ${index + 1}: ${line.substring(0, 20)}... (No '=' found)`);
        }
    });
    console.log('----------------------------');

} catch (err) {
    console.error('Error:', err);
}
