/* ---------- styles ---------- */
(function(){
  const css=`
.uiP{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;min-width:0}
.uiSb{display:flex;align-items:center;gap:8px;background:var(--panel);border:1.5px solid var(--line);border-radius:var(--r-lg);padding:0 8px 0 14px;min-height:54px;box-shadow:var(--sh1);transition:border-color var(--dur1),box-shadow var(--dur1)}
.uiSb:focus-within{border-color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 18%,transparent)}
.uiSb>svg{width:22px;height:22px;flex:none;stroke:var(--muted);fill:none;stroke-width:2;stroke-linecap:round}
.uiPq{flex:1;min-width:0;border:0;background:transparent;font-size:16px;min-height:50px;color:var(--ink)}
.uiPq:focus-visible{outline:none}
.uiPq::-webkit-search-cancel-button{display:none}
.uiClr{width:40px;height:40px;border:0;border-radius:50%;background:var(--panel2);font-size:20px;line-height:1;color:var(--muted);flex:none}
.uiFr{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 1px;align-items:center}
.uiFr::-webkit-scrollbar{display:none}
.uiFr>*{flex:none}
.uiSeg{display:inline-flex;gap:4px;padding:3px;border-radius:999px;background:var(--panel2);border:1px solid var(--line)}
.uiSeg .uiCh{border-color:transparent;background:transparent;min-height:36px}
.uiCh{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel);font-size:13.5px;font-weight:500;color:var(--ink);white-space:nowrap;transition:background var(--dur1),border-color var(--dur1)}
.uiCh:hover{border-color:color-mix(in srgb,var(--accent) 55%,var(--line))}
.uiCh[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.uiCh:disabled{opacity:.4}
.uiClear{border-style:dashed;color:var(--muted)}
.uiPar b{font-size:16px}
.uiDot{width:9px;height:9px;border-radius:50%;background:var(--c);flex:none;display:inline-block}
.uiHd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:4px}
.uiHd h3{margin:0;font-size:var(--fs-lg);font-weight:600}
.uiHd em,.uiGh em{font-style:normal;font-family:var(--font-mono);font-size:12.5px;color:var(--muted);background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:1px 9px;margin-inline-start:6px}
.uiBk{display:inline-flex;align-items:center;gap:4px;min-height:40px;padding:0 14px 0 10px;border:1px solid var(--line);border-radius:999px;background:var(--panel);font-size:13.5px;font-weight:500}
.uiBk svg,.uiGo{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.uiGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media (min-width:560px){.uiGrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (min-width:820px){.uiGrid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (min-width:1100px){.uiGrid{grid-template-columns:repeat(6,minmax(0,1fr))}}
.uiCard{display:grid;gap:4px;align-content:start;text-align:start;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--panel);padding:8px 8px 10px;min-width:0;box-shadow:var(--sh1);transition:transform var(--dur1) var(--ease),box-shadow var(--dur1),border-color var(--dur1);color:var(--ink)}
.uiCard:hover{transform:translateY(-2px);box-shadow:var(--sh2)}
.uiCard[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent)}
.uiTh{aspect-ratio:4/3;border-radius:var(--r);background:var(--thumb-bg);display:grid;place-items:center;overflow:hidden}
.uiTh img{width:100%;height:100%;object-fit:contain}
.uiCard b{font-size:14px;font-weight:600;line-height:1.4;padding-inline:4px}
.uiCard small{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;padding-inline:4px}
.uiBrowse{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;width:100%;text-align:start;padding:16px 18px;border-radius:var(--r-xl);border:1px solid color-mix(in srgb,var(--gold) 45%,var(--line));background:linear-gradient(135deg,color-mix(in srgb,var(--gold) 18%,var(--panel)),var(--panel) 65%);color:var(--ink);box-shadow:var(--sh2);margin-top:6px;min-height:76px;transition:transform var(--dur1) var(--ease)}
.uiBrowse:hover{transform:translateY(-2px)}
.uiBi{width:46px;height:46px;border-radius:14px;background:linear-gradient(180deg,var(--gold),var(--gold2));display:grid;place-items:center;color:var(--gold-ink)}
.uiBi svg{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.uiBt{display:grid;gap:2px;min-width:0}.uiBt b{font-size:var(--fs-lg);font-weight:600}.uiBt small{font-size:var(--fs-sm);color:var(--muted);line-height:1.5}
.uiAcc{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.uiG{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.uiGh{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:12px;width:100%;min-height:60px;padding:8px 14px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--panel);text-align:start;box-shadow:var(--sh1);color:var(--ink)}
.uiGh b{font-weight:600;font-size:15px;line-height:1.4}
.uiGh em{margin:0}
.uiOpen>.uiGh{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.uiChev{width:20px;height:20px;stroke:var(--muted);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform var(--dur2) var(--ease)}
.uiOpen .uiChev{transform:rotate(180deg)}
.uiAta{min-width:50px;height:38px;padding:0 6px;border-radius:11px;display:grid;place-items:center;font-family:var(--font-mono);font-size:12.5px;font-weight:600;color:var(--c);background:color-mix(in srgb,var(--c) 13%,var(--panel));border:1px solid color-mix(in srgb,var(--c) 32%,var(--line));direction:ltr}
.uiGb{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;padding-inline:2px;animation:uiIn var(--dur2) var(--ease) both}
@keyframes uiIn{from{opacity:0;transform:translateY(-6px)}}
.uiChs{padding-bottom:4px}
.uiChh{display:flex;align-items:center;gap:8px;margin:10px 2px 2px;font-size:13px;font-weight:600;color:var(--muted)}
.uiChh span{font-family:var(--font-mono);color:var(--signal);font-size:12px;direction:ltr}
.uiChh em{font-style:normal;font-family:var(--font-mono);font-size:11.5px;margin-inline-start:auto}
.uiList{display:grid;grid-template-columns:minmax(0,1fr);gap:6px}
.uiRow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;text-align:start;min-height:58px;padding:8px 12px;border:1px solid var(--line);border-radius:var(--r);background:var(--panel);color:var(--ink);width:100%;transition:border-color var(--dur1),background var(--dur1)}
.uiRow:hover{border-color:color-mix(in srgb,var(--accent) 55%,var(--line))}
.uiRow[aria-pressed="true"]{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 9%,var(--panel))}
.uiOther{opacity:.62}
.uiRt{display:grid;gap:1px;min-width:0}
.uiRt b{font-weight:600;font-size:14.5px;line-height:1.45}
.uiRt small{font-family:var(--font-mono);font-size:11.5px;color:var(--muted);direction:ltr;text-align:end;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uiTags{display:grid;gap:2px;justify-items:end;font-size:11.5px;color:var(--muted);text-align:end}
.uiSy{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--ink)}
.uiMeta{font-family:var(--font-mono);font-size:11px;direction:ltr;white-space:nowrap}
.uiFlag{font-style:normal;font-weight:500;font-size:10.5px;margin-inline-start:6px;padding:1px 7px;border-radius:999px;background:var(--panel2);border:1px solid var(--line);color:var(--muted);vertical-align:1px;white-space:nowrap}
.uiLv{display:grid;gap:2px;width:8px}
.uiLv i{display:block;height:6px;border-radius:2px;background:var(--line)}
.uiLv[data-lv="1"] i:nth-child(3){background:var(--hyd)}
.uiLv[data-lv="2"] i:nth-child(n+2){background:var(--fuel)}
.uiLv[data-lv="3"] i{background:var(--power)}
.uiHl{background:color-mix(in srgb,var(--gold) 42%,transparent);color:inherit;border-radius:3px;padding:0 1px}
.uiPg{display:flex;align-items:center;justify-content:center;gap:14px;padding:10px 0;font-family:var(--font-mono);color:var(--muted);font-size:13px}
.uiPg .uiCh{min-height:44px;min-width:92px;justify-content:center}
.uiEmpty{display:grid;gap:8px;justify-items:center;text-align:center;padding:36px 16px;border:1px dashed var(--line);border-radius:var(--r-lg);color:var(--muted)}
.uiEmpty b{color:var(--ink);font-size:var(--fs-lg)}
.uiMeta2{display:flex;flex-wrap:wrap;gap:6px}
#uiCardMeta{display:flex;flex-wrap:wrap;gap:6px}
.uiBadge{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:500;background:var(--panel2);border:1px solid var(--line);color:var(--ink)}
.uiB1{background:color-mix(in srgb,var(--hyd) 14%,var(--panel));border-color:color-mix(in srgb,var(--hyd) 40%,var(--line))}
.uiB2{background:color-mix(in srgb,var(--fuel) 14%,var(--panel));border-color:color-mix(in srgb,var(--fuel) 40%,var(--line))}
.uiB3{background:color-mix(in srgb,var(--power) 12%,var(--panel));border-color:color-mix(in srgb,var(--power) 40%,var(--line))}
#uiCardRel>div{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.uiRel{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--panel);font-size:13px;color:var(--ink)}
.uiRel:hover{border-color:var(--accent)}
.uiKids{flex:1 0 100%;justify-content:center}
.uiBook{margin:6px 0 0;font-size:13.5px;line-height:1.6}
.uiBook b{font-family:var(--font-mono);font-weight:500;font-size:12.5px;display:block;text-align:start}
`;
  const st=document.createElement("style"); st.id="uiPartsCss"; st.textContent=css; document.head.appendChild(st);
})();
