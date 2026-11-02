const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'emails.json');
const PORT = 9000;
const LANDING_DIR = '/home/bryan/unmindy/landing';

function loadEmails() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading emails:', e);
  }
  return [];
}

function saveEmails(emails) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(emails, null, 2));
  } catch (e) {
    console.error('Error saving emails:', e);
  }
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`, flush=true);

  // Serve static files from landing directory
  let filePath = req.url.split('?')[0];
  if (filePath === '/') filePath = '/index.html';
  
  const fullPath = path.join(LANDING_DIR, filePath);
  
  if (req.method === 'GET' && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4'
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(fullPath));
    return;
  }

  if (req.method === 'GET' && req.url === '/emails') {
    const emails = loadEmails();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(emails));
    return;
  }

  if (req.method === 'POST' && req.url === '/signup') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const emails = loadEmails();
        const entry = {
          email: data.email,
          referred_by: data.referred_by || null,
          timestamp: new Date().toISOString()
        };
        emails.push(entry);
        saveEmails(emails);
        console.log('Saved:', entry.email, flush=true);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, code: 'sprint-' + Math.random().toString(36).substr(2, 5) }));
      } catch (e) {
        console.error('Error:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signup server running on port ${PORT}`, flush=true);
});
