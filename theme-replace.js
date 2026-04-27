const fs = require('fs');

let gamePath = 'app/src/app/game/page.tsx';
let content = fs.readFileSync(gamePath, 'utf8');

// Replace em-dashes
content = content.replace(/—/g, '-');

// Replace hardcoded dark mode colors
content = content.replace(/bg-\[#050a18\](?!(\/[0-9]+)?)/g, 'bg-[var(--bg)]');
content = content.replace(/bg-\[#0c1423\]/g, 'bg-[var(--surface)]');
content = content.replace(/bg-\[#07101e\]/g, 'bg-[var(--surface-alt)]');
content = content.replace(/bg-\[#060c1a\]/g, 'bg-[var(--surface-alt)]');
content = content.replace(/bg-\[#070e1b\]/g, 'bg-[var(--surface-alt)]');
content = content.replace(/bg-\[#0d1a2e\]/g, 'bg-[var(--surface-alt)]');

content = content.replace(/border-white\/\[0\.0[0-9]+\]/g, 'border-[var(--border)]');
content = content.replace(/bg-white\/\[0\.0[0-9]+\]/g, 'bg-[var(--surface-alt)]');

content = content.replace(/text-white/g, 'text-[var(--text)]');
content = content.replace(/text-slate-[123]00/g, 'text-[var(--text)]');
content = content.replace(/text-slate-[45678]00/g, 'text-[var(--text-muted)]');
content = content.replace(/border-slate-[678]00/g, 'border-[var(--border)]');

fs.writeFileSync(gamePath, content, 'utf8');

// Do the same for page.tsx
let homePath = 'app/src/app/page.tsx';
let homeContent = fs.readFileSync(homePath, 'utf8');
homeContent = homeContent.replace(/—/g, '-');
homeContent = homeContent.replace(/bg-\[#050a18\]/g, 'bg-[var(--bg)]');
homeContent = homeContent.replace(/border-white\/\[0\.0[0-9]+\]/g, 'border-[var(--border)]');
homeContent = homeContent.replace(/bg-white\/\[0\.0[0-9]+\]/g, 'bg-[var(--surface)]');
homeContent = homeContent.replace(/text-white/g, 'text-[var(--text)]');
homeContent = homeContent.replace(/text-slate-[123]00/g, 'text-[var(--text)]');
homeContent = homeContent.replace(/text-slate-[45678]00/g, 'text-[var(--text-muted)]');
homeContent = homeContent.replace(/border-slate-[678]00/g, 'border-[var(--border)]');
fs.writeFileSync(homePath, homeContent, 'utf8');

// Globals.css
let cssPath = 'app/src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/—/g, '-');
fs.writeFileSync(cssPath, css, 'utf8');

// narrative.ts
let narPath = 'app/src/lib/narrative.ts';
let nar = fs.readFileSync(narPath, 'utf8');
nar = nar.replace(/—/g, '-');
fs.writeFileSync(narPath, nar, 'utf8');

// layout.tsx
let layoutPath = 'app/src/app/layout.tsx';
let layout = fs.readFileSync(layoutPath, 'utf8');
layout = layout.replace(/—/g, '-');
fs.writeFileSync(layoutPath, layout, 'utf8');

console.log('Replacements done.');
