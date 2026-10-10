// Local preview server mimicking GitHub Pages at /foog-pitch/ (404.html fallback).
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(process.argv[2] || 'docs'); const base = '/foog-pitch'; const port = +(process.argv[3] || 4321);
const types = { '.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json','.ttf':'font/ttf','.woff2':'font/woff2','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.txt':'text/plain' };
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith(base)) { res.writeHead(404); return res.end('not under base'); }
  let p = path.join(root, u.slice(base.length));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { const nf = path.join(root, '404.html'); res.writeHead(404, { 'content-type': types['.html'] }); return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'nf'); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(fs.readFileSync(p));
}).listen(port, () => console.log('http://localhost:' + port + base + '/'));
