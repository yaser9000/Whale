async function fetchData() {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = "جاري التحميل...";

  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    const data = await response.json();

    const filtered = data
      .filter(item =>
        item.symbol.endsWith("USDT") &&
        !item.symbol.includes("BUSD") &&
        !item.symbol.includes("USDC") &&
        parseFloat(item.priceChangePercent) >= 4
      )
      .slice(0, 12); // عرض أول 12 عملة فقط كتجربة

    container.innerHTML = "";

    filtered.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      const change = parseFloat(item.priceChangePercent).toFixed(2);
      const volumeValue = parseFloat(item.quoteVolume).toFixed(2);
      const volumePercent = Math.min(100, Math.log10(volumeValue + 1) * 20);

      card.innerHTML = `
        <div class="symbol">${item.symbol}</div>
        <div class="change">+${change}%</div>
        <div class="label rsi true">RSI: —</div>
        <div class="label macd true">MACD: —</div>
        <div class="label vol true">Volume: ${volumeValue}</div>
        <div class="volume-bar"><span style="width:${volumePercent}%; background-color:${volumePercent > 70 ? '#00e676' : volumePercent > 40 ? '#ffc107' : '#f44336'}"></span></div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    container.innerHTML = "حدث خطأ أثناء جلب البيانات.";
    console.error(error);
  }
}

window.onload = fetchData;
