// Rolling returns & basic CAGR helpers
export function computeRollingReturns(navHistory, windowYearsArray = [1,3,5]) {
  if (!Array.isArray(navHistory) || navHistory.length === 0) return [];
  // navHistory: [{date, nav}] expected oldest->newest or newest->oldest we'll normalize
  const sorted = [...navHistory].sort((a,b)=> new Date(a.date)-new Date(b.date));
  const results = [];
  const msPerDay = 86400000;
  windowYearsArray.forEach(years => {
    const minDays = Math.round(years * 365.25) - 3; // tolerance for leap days
    for (let i=0;i<sorted.length;i++) {
      const start = sorted[i];
      const startDate = new Date(start.date);
      // binary search for end index ~ years ahead
      for (let j=i+1;j<sorted.length;j++) {
        const end = sorted[j];
        const days = (new Date(end.date)-startDate)/msPerDay;
        if (days >= minDays) {
          const cagr = Math.pow(parseFloat(end.nav)/parseFloat(start.nav), 365.25/days) - 1;
          results.push({ windowYears: years, startDate: start.date, endDate: end.date, cagr });
          break;
        }
      }
    }
  });
  return results;
}

export function summarizeRolling(rolling) {
  const grouped = {};
  for (const r of rolling) {
    const k = r.windowYears;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(r.cagr);
  }
  return Object.entries(grouped).map(([years, arr]) => {
    arr.sort((a,b)=>a-b);
    const avg = arr.reduce((s,v)=>s+v,0)/arr.length;
    const min = arr[0];
    const max = arr[arr.length-1];
    const p10 = arr[Math.floor(arr.length*0.1)] ?? arr[0];
    const p90 = arr[Math.floor(arr.length*0.9)] ?? arr[arr.length-1];
    return { years: Number(years), count: arr.length, avg, min, max, p10, p90 };
  }).sort((a,b)=>a.years-b.years);
}

export function computeDrawdown(navHistory) {
  if (!Array.isArray(navHistory) || navHistory.length === 0) return { series: [], maxDrawdown: 0 };
  const sorted = [...navHistory].sort((a,b)=> new Date(a.date)-new Date(b.date));
  let peak = parseFloat(sorted[0].nav);
  let maxDD = 0;
  const series = sorted.map(p => {
    const nav = parseFloat(p.nav);
    if (nav > peak) peak = nav;
    const dd = (nav - peak)/peak; // negative or zero
    if (dd < maxDD) maxDD = dd;
    return { date: p.date, drawdown: dd };
  });
  return { series, maxDrawdown: maxDD };
}
