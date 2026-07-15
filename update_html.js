const fs = require('fs');
const files = ['admin.html', 'details.html', 'request.html', 'trust.html', 'volunteer.html'];
for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    const target = 'onclick="doLogout()">🚪 Logout</button>';
    const replacement = 'onclick="openSettingsModal()">⚙️ Settings</button>\n    <button class="btn btn-sm btn-ghost" onclick="doLogout()">🚪 Logout</button>';
    if (content.includes(target) && !content.includes('openSettingsModal')) {
        content = content.replace(target, replacement);
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    } else {
        console.log('Skipped ' + file);
    }
}
