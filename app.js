/* VXL Protocol — Swap Interface prototype (inspired by Arina's Dribbble concepts) */
"use strict";

/* ---------------- token data ---------------- */
const TOKENS = {
  VXL:  { sym:"VXL",  name:"Voxel",     price:2.418,  color:"#8b5cf6", bal:4250.5,  vol:0.010 },
  ETH:  { sym:"ETH",  name:"Ethereum",  price:3419.5, color:"#627eea", bal:3.42,    vol:0.006 },
  USDC: { sym:"USDC", name:"USD Coin",  price:1.0,    color:"#2775ca", bal:9820.11, vol:0.001 },
  UNI:  { sym:"UNI",  name:"Uniswap",   price:11.07,  color:"#ff007a", bal:640.0,   vol:0.012 },
  BNB:  { sym:"BNB",  name:"Binance",   price:692.4,  color:"#f0b90b", bal:12.3,    vol:0.008 },
  SOL:  { sym:"SOL",  name:"Solana",    price:212.8,  color:"#9945ff", bal:88.2,    vol:0.014 },
  BTC:  { sym:"BTC",  name:"Bitcoin",   price:117430, color:"#f7931a", bal:0.241,   vol:0.005 },
  BITE: { sym:"BITE", name:"Bite",      price:32.8,   color:"#22c55e", bal:1500.0,  vol:0.018 },
  BLK:  { sym:"BLK",  name:"Blockmine", price:75.89,  color:"#06b6d4", bal:220.4,   vol:0.013 },
};
const LIST_TOKENS = ["UNI","BNB","BLK","BITE"];   // hero list order (like reference)
const NODE_CARDS = [
  {emoji:"🌐", title:"VoxNodes Node Network", text:"Decentralized services and tools enabling automated node hosting and management for everyone.", theme:"violet"},
  {emoji:"◈", title:"VXL Liquidity Grid", text:"Route swaps through a resilient liquidity layer built for fast, transparent movement.", theme:"silver"},
  {emoji:"✦", title:"GameFi World Engine", text:"Composable rails for NFT economies, virtual worlds, and the next generation of play.", theme:"cyan"},
  {emoji:"⌁", title:"Autonomous Builders", text:"Ship programmable on-chain experiences with modular tools made for ambitious teams.", theme:"orange"}
];

/* ---------------- state ---------------- */
let sellTok = "ETH", buyTok = "USDC";
let slippage = 0.5;
let history = [];
let nodeIndex = 0;

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = (n,d=2) => n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const toast = m => { const t=$("#toast"); $("#toast-msg").textContent=m; t.classList.add("show");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2200); };

/* ---------------- hero token list + live sparklines ---------------- */
const sparkData = {};
function seedSpark(sym){
  const t = TOKENS[sym]; const pts=[]; let p = t.price * (1 - t.price*t.vol*8/ t.price);
  for(let i=0;i<28;i++){ pts.push(t.price*(1 + (Math.random()-0.5)*t.vol*8)); }
  sparkData[sym]=pts;
}
LIST_TOKENS.forEach(seedSpark);

function drawSpark(canvas, pts, up){
  const dpr = window.devicePixelRatio||1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if(canvas.width!==w*dpr){ canvas.width=w*dpr; canvas.height=h*dpr; }
  const c = canvas.getContext("2d"); c.setTransform(dpr,0,0,dpr,0,0);
  c.clearRect(0,0,w,h);
  const min=Math.min(...pts), max=Math.max(...pts), span=(max-min)||1;
  c.beginPath();
  pts.forEach((p,i)=>{ const x=i/(pts.length-1)*w, y=h-3-((p-min)/span)*(h-6); i?c.lineTo(x,y):c.moveTo(x,y); });
  c.strokeStyle = up ? "#3ddc84" : "#ff6b6b"; c.lineWidth=1.6; c.stroke();
  c.lineTo(w,h); c.lineTo(0,h); c.closePath();
  const g=c.createLinearGradient(0,0,0,h);
  g.addColorStop(0, up?"rgba(61,220,132,.25)":"rgba(255,107,107,.25)");
  g.addColorStop(1,"rgba(0,0,0,0)"); c.fillStyle=g; c.fill();
}
function chg(sym){ const pts=sparkData[sym]; return (pts[pts.length-1]-pts[0])/pts[0]*100; }

function renderHeroList(){
  $("#tokenList").innerHTML = LIST_TOKENS.map(sym=>{
    const t=TOKENS[sym], c=chg(sym), up=c>=0;
    return `<div class="token-row" data-sym="${sym}" onclick="quickSwap('${sym}')">
      <span class="t-ico" style="background:${t.color}">${sym[0]}</span>
      <span class="t-name"><b>${t.name}</b><span>${sym} / USD</span></span>
      <canvas class="t-spark" data-spark="${sym}"></canvas>
      <span><span class="t-price">$${fmt(t.price, t.price>1000?0:2)}</span><br>
      <span class="t-chg ${up?"up":"down"}">${up?"▲":"▼"} ${Math.abs(c).toFixed(1)}%</span></span>
    </div>`;
  }).join("");
  $$("#tokenList canvas[data-spark]").forEach(cv=>{
    const sym=cv.dataset.spark; cv.width=cv.clientWidth; cv.height=cv.clientHeight;
    drawSpark(cv, sparkData[sym], chg(sym)>=0);
  });
}
/* live price simulation */
setInterval(()=>{
  const syms = Object.keys(TOKENS);
  const sym = syms[Math.floor(Math.random()*syms.length)];
  const t = TOKENS[sym];
  t.price *= 1 + (Math.random()-0.5)*t.vol;
  if(sparkData[sym]){ sparkData[sym].push(t.price); sparkData[sym].shift(); }
  // refresh hero rows
  $$("#tokenList .token-row").forEach(row=>{
    if(row.dataset.sym!==sym) return;
    const c=chg(sym), up=c>=0;
    row.querySelector(".t-price").textContent = "$"+fmt(t.price, t.price>1000?0:2);
    const ch=row.querySelector(".t-chg");
    ch.className="t-chg "+(up?"up":"down");
    ch.textContent=`${up?"▲":"▼"} ${Math.abs(c).toFixed(1)}%`;
    drawSpark(row.querySelector("canvas"), sparkData[sym], up);
  });
  // refresh swap quotes if involved
  if(sellTok===sym||buyTok===sym) updateQuote(false);
}, 1800);

/* ---------------- animated tx counter ---------------- */
function countUp(el, target, dur=2200){
  const start=performance.now();
  const step = now=>{
    const p=Math.min(1,(now-start)/dur), e=1-Math.pow(1-p,3);
    el.textContent = Math.floor(target*e).toLocaleString("en-US");
    if(p<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------------- swap logic ---------------- */
function rate(from,to){ return TOKENS[from].price / TOKENS[to].price; }
function updateQuote(animate=true){
  const sellIn = parseFloat($("#sellInput").value)||0;
  const out = sellIn * rate(sellTok,buyTok) * (1 - 0.003); // 0.3% fee
  $("#buyInput").value = sellIn>0 ? fmt(out, out<1?6:4) : "";
  $("#sellFiat").textContent = sellIn>0 ? "≈ $"+fmt(sellIn*TOKENS[sellTok].price) : "$0.00";
  $("#buyFiat").textContent  = sellIn>0 ? "≈ $"+fmt(out*TOKENS[buyTok].price)  : "$0.00";
  $("#rateLine").innerHTML   = `1 ${sellTok} = <b>${fmt(rate(sellTok,buyTok), rate(sellTok,buyTok)<1?6:4)} ${buyTok}</b>`;
  const impact = sellIn*TOKENS[sellTok].price > 50000 ? "2.1%" : sellIn*TOKENS[sellTok].price > 10000 ? "0.8%" : "< 0.1%";
  $("#impactLine").innerHTML = `Price impact <b>${impact}</b>`;
  renderSwapBtn(sellIn);
  renderTokenButtons();
  renderBalances();
}
function renderBalances(){
  $("#sellBal").textContent = `Balance: ${fmt(TOKENS[sellTok].bal, TOKENS[sellTok].bal<10?4:2)} ${sellTok}`;
  $("#buyBal").textContent  = `Balance: ${fmt(TOKENS[buyTok].bal, TOKENS[buyTok].bal<10?4:2)} ${buyTok}`;
}
function renderTokenButtons(){
  const btn = (sym)=>`<span class="t-ico" style="background:${TOKENS[sym].color};width:24px;height:24px;font-size:11px">${sym[0]}</span> ${sym} ▾`;
  $("#sellTokBtn").innerHTML = btn(sellTok);
  $("#buyTokBtn").innerHTML  = btn(buyTok);
}
function renderSwapBtn(sellIn){
  const btn=$("#swapCta");
  const t=TOKENS[sellTok];
  if(!sellIn || sellIn<=0){ btn.className="swap-cta disabled"; btn.textContent="Enter an amount"; }
  else if(sellIn > t.bal){  btn.className="swap-cta disabled"; btn.textContent=`Insufficient ${sellTok} balance`; }
  else { btn.className="swap-cta ready"; btn.textContent=`Swap ${sellTok} → ${buyTok}`; }
}
function flipTokens(){
  [sellTok,buyTok]=[buyTok,sellTok];
  const box=$("#buyBox"); box.style.transform="scale(.97)";
  setTimeout(()=>box.style.transform="",200);
  updateQuote();
}
function setMax(){ $("#sellInput").value = TOKENS[sellTok].bal; updateQuote(); }

/* token select modal */
let pickSide = "sell";
function openPicker(side){
  pickSide = side;
  renderPicker("");
  $("#tokenModal").classList.add("open");
  setTimeout(()=>$("#tokenSearch").focus(),50);
}
function renderPicker(q){
  q=q.toLowerCase();
  $("#tokenRows").innerHTML = Object.entries(TOKENS)
    .filter(([s,t]) => !q || s.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
    .map(([s,t])=>`<div class="tk-row" onclick="pickToken('${s}')">
      <span class="t-ico" style="background:${t.color}">${s[0]}</span>
      <span><b style="font-size:13.5px">${t.name}</b><br><small style="color:var(--muted);font-size:11px">${s}</small></span>
      <span class="bal"><b>${fmt(t.bal, t.bal<10?4:2)}</b>$${fmt(t.price, t.price>1000?0:2)}</span>
    </div>`).join("");
}
function pickToken(sym){
  if(pickSide==="sell"){ if(sym===buyTok) buyTok=sellTok; sellTok=sym; }
  else { if(sym===sellTok) sellTok=buyTok; buyTok=sym; }
  closeModal("#tokenModal"); updateQuote();
}
function quickSwap(sym){
  sellTok = sym; buyTok = "USDC";
  switchView("swap"); updateQuote();
  toast(`Loaded ${sym} → USDC`);
}

/* ---------------- hero card carousel ---------------- */
function renderNodeCard(index=nodeIndex){
  nodeIndex = (index + NODE_CARDS.length) % NODE_CARDS.length;
  const card = NODE_CARDS[nodeIndex];
  const art = $("#nodeArt");
  if(!art) return;
  art.dataset.theme = card.theme;
  $("#nodeCount").textContent = `${nodeIndex + 1} / ${NODE_CARDS.length}`;
  $("#nodeTitle").textContent = `${card.emoji} ${card.title}`;
  $("#nodeDescription").textContent = card.text;
  $("#nodeDots").innerHTML = NODE_CARDS.map((_,i)=>`<i class="${i===nodeIndex?"on":""}" onclick="setNodeCard(${i})" aria-label="Show card ${i+1}"></i>`).join("");
}
function setNodeCard(index){ renderNodeCard(index); }
function cycleNodeCard(){ renderNodeCard(nodeIndex + 1); }
function openSwapFromNav(){
  switchView("swap");
  const cta = $("#headerCta");
  if(cta){ cta.classList.add("clicked"); setTimeout(()=>cta.classList.remove("clicked"),500); }
}

/* ---------------- execute swap ---------------- */
function doSwap(){
  const sellIn = parseFloat($("#sellInput").value)||0;
  const t = TOKENS[sellTok];
  if(!sellIn || sellIn<=0 || sellIn>t.bal) return;
  const out = sellIn * rate(sellTok,buyTok) * (1-0.003);
  // confirmation
  $("#cfFrom").innerHTML = `<div class="amt">${fmt(sellIn)} ${sellTok}</div>`;
  $("#cfTo").innerHTML   = `<div class="amt to">≈ ${fmt(out, out<1?6:4)} ${buyTok}</div>`;
  $("#cfRate").textContent = `1 ${sellTok} = ${fmt(rate(sellTok,buyTok),6)} ${buyTok}`;
  $("#cfSlip").textContent = slippage;
  $("#confirmModal .processing").classList.remove("show");
  $("#confirmModal .confirm-body").style.display="block";
  $("#confirmModal").classList.add("open");
}
function confirmSwap(){
  const sellIn = parseFloat($("#sellInput").value)||0;
  const t=TOKENS[sellTok];
  const out = sellIn * rate(sellTok,buyTok) * (1-0.003);
  $("#confirmModal .confirm-body").style.display="none";
  $("#confirmModal .processing").classList.add("show");
  $("#procTxt").textContent="Swapping…";
  setTimeout(()=>{
    t.bal -= sellIn; TOKENS[buyTok].bal += out;
    history.unshift({from:sellTok,to:buyTok,amt:sellIn,out,time:new Date()});
    $("#procBox").innerHTML = `<div class="checkmark">✓</div>
      <div style="font-weight:800;font-size:17px;margin-bottom:6px">Swap successful</div>
      <div style="font-size:12px;color:var(--muted)">You received ${fmt(out, out<1?6:4)} ${buyTok}</div>`;
    $("#sellInput").value=""; updateQuote(); renderHistory();
    setTimeout(()=>{ closeModal("#confirmModal"); toast("Swap confirmed ✓"); }, 1400);
  }, 1600);
}
function renderHistory(){
  const box=$("#histRows");
  if(!history.length){ box.innerHTML=`<div class="empty">No swaps yet — your history will appear here.</div>`; return; }
  box.innerHTML = history.map(h=>`<div class="hrow">
    <span class="pair"><span class="t-ico" style="background:${TOKENS[h.from].color}">${h.from[0]}</span>
    <span class="t-ico" style="background:${TOKENS[h.to].color}">${h.to[0]}</span></span>
    <span class="amt"><b>${fmt(h.amt)} ${h.from} → ${fmt(h.out, h.out<1?6:4)} ${h.to}</b>
    <span>${h.time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})} · fee 0.3%</span></span>
    <span class="st">● Confirmed</span>
  </div>`).join("");
}

/* ---------------- misc UI ---------------- */
function switchView(v){
  $$(".view").forEach(x=>x.classList.toggle("active", x.id==="view-"+v));
  if(v==="home"){ $("#txCount") && countUp($("#txCount"), 932973890); }
  window.scrollTo({top:0,behavior:"smooth"});
}
function closeModal(sel){ $(sel).classList.remove("open"); }
function toggleTheme(){
  document.body.classList.toggle("light");
  toast(document.body.classList.contains("light")?"Light theme":"Dark theme");
}
function setSlip(v, btn){
  slippage=v;
  $$(".slippage-btns button").forEach(b=>b.classList.toggle("on", b===btn));
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderHeroList(); renderNodeCard(); renderSwapBtn(0); renderTokenButtons(); renderBalances(); renderHistory();
  updateQuote();
  countUp($("#txCount"), 932973890, 2600);
  $("#sellInput").addEventListener("input", ()=>updateQuote());
  $("#tokenSearch").addEventListener("input", e=>renderPicker(e.target.value));
  $$(".modal-back").forEach(m=>m.addEventListener("click",e=>{ if(e.target===m) m.classList.remove("open"); }));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") $$(".modal-back.open").forEach(m=>m.classList.remove("open")); });
  setInterval(cycleNodeCard, 6500);
});
