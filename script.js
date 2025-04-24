const excluded = ['USDT','BUSD','USDC','TUSD'];

async function fetchTopCoins() {
  const container = document.getElementById('coins');
  container.innerHTML = 'جارٍ التحميل...';

  // جلب أعلى 60 عملة حسب السيولة
  const resp = await fetch('https://api.binance.com/api/v3/ticker/24hr');
  const all = await resp.json();
  const top = all
    .filter(c => !excluded.some(s => c.symbol.endsWith(s)))
    .sort((a,b)=>parseFloat(b.quoteVolume)-parseFloat(a.quoteVolume))
    .slice(0, 60);

  const results = [];
  for (let c of top) {
    try {
      const kl = await fetch(`https://api.binance.com/api/v3/klines?symbol=${c.symbol}&interval=1h&limit=8`)
        .then(r=>r.json());
      if (kl.length<8) continue;

      const vols = kl.slice(0,7).map(k=>+k[5]);
      const avgVol = vols.reduce((a,b)=>a+b)/7;
      const curVol = +kl[7][5];
      const volJump = (curVol - avgVol)/avgVol*100;

      const open = +kl[7][1], close = +kl[7][4];
      const change = (close-open)/open*100;

      if (change>=5 && volJump>=150) {
        results.push({
          symbol: c.symbol,
          change: change.toFixed(2),
          volJump: volJump.toFixed(1),
          volume: curVol.toLocaleString()
        });
      }
    } catch(e){}
  }

  container.innerHTML = results.length
    ? results.map(r=>`
        <div class="card">
          <h2>${r.symbol}</h2>
          <div class="metric">ارتفاع 1h: <strong class="green">+${r.change}%</strong></div>
          <div class="metric">قفزة السيولة: <strong>${r.volJump}%</strong></div>
          <div class="metric">الحجم: ${r.volume}</div>
        </div>
      `).join('')
    : '<p>لا توجد عملات تحقق الشروط الآن.</p>';
}

// اختياريّ: تحميل تلقائي عند فتح الصفحة
window.onload = fetchTopCoins;
