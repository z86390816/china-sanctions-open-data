// 判断这一次推送要不要发 Release，要发就把 tag 与正文一起算出来。
//
// 为什么需要它：Zenodo 只在发 Release 的那一刻存档，所以数据更新了必须发一个，
// 否则按 DOI 下载到的永远是上一版——而 DOI 正是给学术引用用的那条路，
// 于是最在意版本准确性的那批人反而拿到最旧的数据。
// 2026-09 就发生过一次：仓库里是 9 月 20 日的数据，DOI 指向的却是 8 月 5 日那份，
// 中间差了六周，而没有任何东西提醒过任何人。
//
// 为什么不能「每次推送都发」：导出脚本每跑一次就更新 generated_at，而定时任务每周跑一次。
// 那样每周都会多一个内容完全相同的版本，Zenodo 上堆一串毫无差别的 DOI——
// 引用的人分不出该引哪一个，而「版本多到无法区分」和「没有版本」一样没用。
//
// 所以判据是 data_changed_at 与 count，不是 generated_at：
//   · generated_at    —— 导出脚本跑过一次（数据可能一模一样）
//   · data_changed_at —— 数据本身真的变了
// 这两个字段当初分开，要回答的正是这个问题。
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (s) => { try { return JSON.parse(s); } catch { return null; } };
const cur = read(readFileSync('manifest.json', 'utf8'));
if (!cur || !Array.isArray(cur.datasets)) { console.error('manifest.json 读不出 datasets，放弃'); process.exit(1); }

// 上一版取父提交的 manifest。取不到（首次提交）时按「有变化」处理
let prev = null;
try { prev = read(execFileSync('git', ['show', 'HEAD~1:manifest.json'], { encoding: 'utf8' })); }
catch { /* 首次提交，或父提交里还没有这个文件 */ }

// 按 id 建索引再比，不比数组顺序：哪天导出脚本换了数据集的输出顺序，
// 按顺序比会被误判成「全变了」，于是发一个内容没动的版本
const sig = (m) => Object.fromEntries((m?.datasets || []).map((d) => [d.id, `${d.count}@${d.data_changed_at || ''}`]));
const a = sig(prev), b = sig(cur);
const ids = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
const changed = ids.filter((id) => a[id] !== b[id]);

const out = process.env.GITHUB_OUTPUT;
const emit = (k, v) => { if (out) appendFileSync(out, `${k}=${v}\n`); else console.log(`  [output] ${k}=${v}`); };

if (!prev) console.log('没有上一版 manifest（首次提交），按有变化处理');
if (!changed.length) {
  console.log('数据没有变化（count 与 data_changed_at 都未变），不发 Release。');
  console.log('  注：generated_at 变了不算——那只说明导出脚本跑过一次，数据可能一模一样。');
  emit('release', 'no');
  process.exit(0);
}

// tag 用数据日期而不是今天：Release 描述的是「这份数据」，不是「谁在哪天按了按钮」
const day = (cur.datasets.map((d) => d.data_changed_at).filter(Boolean).sort().pop() || cur.generated_at || '')
  .replace(/-/g, '') || new Date().toISOString().slice(0, 10).replace(/-/g, '');
const total = cur.datasets.reduce((s, d) => s + (d.count || 0), 0);

const L = [];
L.push('Machine-readable China sanctions / export-control lists and EU Regulation 833/2014');
L.push(`Annex IV military end-users. ${total} entries in total, as flat JSON and CSV.`);
L.push('');
L.push('What changed in this version:');
for (const id of changed) {
  const before = a[id], after = b[id];
  if (!before) { L.push(`- ${id}: new dataset (${after.split('@')[0]} entries)`); continue; }
  if (!after) { L.push(`- ${id}: removed`); continue; }
  const [c0, d0] = before.split('@'); const [c1, d1] = after.split('@');
  const bits = [];
  if (c0 !== c1) bits.push(`${c0} → ${c1} entries`);
  if (d0 !== d1) bits.push(`data last changed ${d1}`);
  L.push(`- ${id}: ${bits.join(', ')}`);
}
L.push('');
for (const d of cur.datasets) L.push(`${d.id}: ${d.count} entries — ${d.title}`);
L.push('');
L.push(`Licence: ${cur.license || 'CC BY 4.0'}. Maintained at ${cur.homepage || 'https://tradeprotected.com'}/data`);
L.push('');
L.push('Archived on Zenodo; cite the concept DOI so the reference always resolves to the latest version.');

writeFileSync('RELEASE_NOTES.md', L.join('\n') + '\n');
emit('release', 'yes');
emit('day', day);
emit('total', String(total));
console.log(`要发 Release：数据日期 ${day}，共 ${total} 条，变化的数据集：${changed.join('、')}`);
