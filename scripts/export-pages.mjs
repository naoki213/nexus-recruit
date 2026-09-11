import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

const response = await fetch("http://localhost:3000/");
if (!response.ok) throw new Error(`Preview returned ${response.status}`);
const source = await response.text();
const main = source.match(/<main>[\s\S]*?<\/main>/)?.[0];
if (!main) throw new Error("Main content was not found");

const css = (await readFile("app/globals.css", "utf8"))
  .replace(/^@import[^;]+;\s*/gm, "")
  .replace(/url\((['"]?)\/images\//g, "url($1images/");

const client = `
const roles={ENGINEER:['エンジニア','仕組みを、動くものにする。','曖昧な問いを分解し、手を動かしながら考えたい人',['09:30 PRレビュー','11:00 実装','14:00 設計相談','16:00 集中開発'],['const idea = observe(problem);','const prototype = build(idea);','return learn(prototype);']],DESIGNER:['デザイナー','まだない使い方を、形にする。','見た目だけでなく、体験の理由まで設計したい人',['09:30 リサーチ','11:00 プロトタイプ','14:00 ユーザーテスト','16:30 UI改善'],['FRAME / ONBOARDING','GRID  12 COL','PROTOTYPE  ● CONNECTED']],SALES:['セールス','売る前に、課題を見つける。','相手の言葉になっていない課題を、一緒に整理したい人',['09:00 商談準備','11:00 ヒアリング','14:30 提案設計','17:00 チーム共有'],['ACCOUNT / NEW','NEED  ● DISCOVERED','NEXT  PROPOSAL REVIEW']],MARKETING:['マーケティング','数字の奥の、人を読む。','仮説と検証を往復し、伝わり方を改善したい人',['09:30 数値確認','11:00 企画','14:00 取材','16:30 分析'],['VISITORS  24,810  ↑12%','SIGNUPS   1,284  ↑08%','INSIGHT   STORY / B']],CORPORATE:['コーポレート','挑戦が続く、土台をつくる。','ルールと人の両方を見ながら、組織を前に進めたい人',['09:30 入社準備','11:00 制度設計','14:00 1on1','16:30 経営会議'],['PEOPLE OPS / ACTIVE','POLICY  ● REVIEW','ONBOARDING  06/08']]};
document.querySelectorAll('.role-tabs button').forEach(b=>b.addEventListener('click',()=>{const r=roles[b.textContent.trim()];document.querySelectorAll('.role-tabs button').forEach(x=>x.setAttribute('aria-selected','false'));b.setAttribute('aria-selected','true');document.querySelector('.role-copy>span').textContent=r[0];document.querySelector('.role-copy h2').textContent=r[1];document.querySelector('.role-copy p').innerHTML='<b>向いている人</b>'+r[2];document.querySelector('.role-copy ul').innerHTML=r[3].map(x=>'<li>'+x+'</li>').join('');document.querySelector('.screen-top span').textContent=b.textContent.trim().toLowerCase()+'.workspace';document.querySelector('.screen-content pre').textContent=r[4].join('\\n\\n');}));
const people=[['高橋 海','新規事業の体験設計を担当しています。正解がないから、観察から始めます。'],['石井 蓮','コードを書かない日は少ないです。でも、先にチームで問いを揃えます。'],['佐藤 澪','営業というより、顧客と一緒に課題の輪郭をつくる仕事です。']];document.querySelectorAll('.dm-list button').forEach((b,i)=>b.addEventListener('click',()=>{document.querySelectorAll('.dm-list button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('.dm-chat .panel-head span').textContent=people[i][0];document.querySelector('.bubble.reply').innerHTML='<b>'+people[i][0]+'</b>'+people[i][1];}));
const careers={SPECIALIST:'技術や表現を深く掘り、難しい問いに名前をつける。肩書きより、専門性でチームを前へ。',MANAGER:'個人の強みをつなぎ、チームの意思決定を良くする。管理ではなく、前進を設計する。','NEW BUSINESS':'顧客のまだ言葉にならない課題から、新しい事業の最初の1ページをつくる。'};document.querySelectorAll('.career-branches button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.career-branches button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const k=b.textContent.replace(/^0\\d/,'').trim();document.querySelector('.career-result span').textContent='SELECTED PATH / '+k;document.querySelector('.career-result p').textContent=careers[k];}));
document.querySelector('.entry-form').addEventListener('submit',e=>{e.preventDefault();e.currentTarget.querySelector('button').textContent='✓  DEMO ENTRY COMPLETE';});addEventListener('scroll',()=>{const m=document.documentElement.scrollHeight-innerHeight;document.querySelector('.scroll-progress').style.width=(m?scrollY/m*100:0)+'%';},{passive:true});
`;

const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NEXUS Inc. Careers｜入社1日目から、5年目まで。</title><meta name="description" content="スクロールで一人の社員の5年間を追体験する、架空IT企業NEXUS Inc.のポートフォリオ採用サイト。"><link rel="icon" href="favicon.svg"><style>${css}</style></head><body>${main.replaceAll('src="/images/','src="images/')}<script>${client}</script></body></html>`;

await mkdir("docs/images", { recursive: true });
await writeFile("docs/index.html", html);
await writeFile("docs/404.html", `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404｜NEXUS Inc.</title><style>${css}</style></head><body><main class="not-found"><span>ERROR / 404</span><strong>PAGE<br>NOT FOUND</strong><p>指定されたページは見つかりませんでした。</p><a href="/nexus-recruit/">NEXUS_OS に戻る →</a></main><style>.not-found{min-height:100svh;padding:8vw;display:flex;flex-direction:column;justify-content:center;background:#111;color:#fff}.not-found span{color:#ff5a36;font:700 14px var(--font-mono)}.not-found strong{margin:30px 0;font:700 clamp(4rem,14vw,11rem)/.8 var(--font-mono);letter-spacing:-.09em}.not-found p{color:#aaa}.not-found a{width:max-content;margin-top:30px;padding:15px;background:#2457ff;font:700 12px var(--font-mono)}</style></body></html>`);
await writeFile("docs/.nojekyll", "");
await copyFile("public/favicon.svg", "docs/favicon.svg");
for (const name of ["day-001.webp", "lunch.webp", "year-03.webp"]) await copyFile(join("public/images", name), join("docs/images", name));
console.log("GitHub Pages export complete");
