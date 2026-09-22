'use client';

import { useState } from 'react';

const initial = {
  people: 4,
  showers: 4,
  showerMinutes: 8,
  toiletUses: 20,
  washingLoads: 4,
  kitchenLitres: 70,
  gardenLitres: 60,
  leakage: 'small',
};

function estimate(d) {
  const shower = Number(d.showers) * Number(d.showerMinutes) * 9;
  const toilet = Number(d.toiletUses) * 6;
  const washing = Number(d.washingLoads) * 55 / 7;
  const kitchen = Number(d.kitchenLitres);
  const garden = Number(d.gardenLitres);
  const leak = d.leakage === 'none' ? 0 : d.leakage === 'small' ? 15 : d.leakage === 'large' ? 45 : 0;
  const total = Math.round(shower + toilet + washing + kitchen + garden + leak);
  const perPerson = Math.round(total / Math.max(1, Number(d.people)));
  const savings = Math.round(
    Math.min(0.28, 0.08 + (d.leakage !== 'none' ? 0.08 : 0) + (Number(d.showerMinutes) > 7 ? 0.06 : 0) + (garden > 50 ? 0.05 : 0)) * total
  );
  const tips = [];
  if (Number(d.showerMinutes) > 7) tips.push('Reduce average shower time by 2 minutes.');
  if (d.leakage !== 'none') tips.push('Repair the leaking tap/pipe as soon as possible.');
  if (garden > 50) tips.push('Water plants early morning/evening and reuse suitable household water.');
  if (Number(d.washingLoads) > 4) tips.push('Run the washing machine only with full loads.');
  tips.push('Turn off the tap while brushing and soaping dishes.');
  tips.push('Track your meter reading weekly to spot unusual increases.');

  let score = 100 - Math.round((total / Math.max(1, Number(d.people)) - 120) / 4);
  score = Math.max(20, Math.min(95, score));

  return { total, perPerson, savings, score, tips };
}

export default function Home() {
  const [data, setData] = useState(initial);
  const [result, setResult] = useState(null);
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState([]);

  const update = (key, value) => setData({ ...data, [key]: value });

  const analyze = () => setResult(estimate(data));

  const askAgent = () => {
    const q = question.trim();
    if (!q) return;
    const r = result || estimate(data);
    let answer = '';
    const low = q.toLowerCase();
    if (low.includes('shower')) {
      answer = `Your current shower estimate is about ${Math.round(data.showers * data.showerMinutes * 9)} L/day. Cutting each shower by 2 minutes could save roughly ${Math.round(data.showers * 2 * 9)} L/day, depending on your shower flow rate.`;
    } else if (low.includes('leak')) {
      answer = data.leakage === 'none'
        ? 'You reported no leak. Still check taps, toilet cisterns and outdoor pipes for silent leaks.'
        : `A ${data.leakage} leak is included in your estimate. Fixing it is one of the quickest ways to reduce avoidable water loss.`;
    } else if (low.includes('garden')) {
      answer = `Your garden estimate is ${data.gardenLitres} L/day. Water during cooler hours, use mulch/drip irrigation where practical, and reuse safe greywater where appropriate.`;
    } else {
      answer = `Based on your current profile, the estimated household use is ${r.total} L/day. Start with your biggest areas: showering, leakage and garden watering. Your initial target is about ${r.savings} L/day of potential reduction.`;
    }
    setChat([...chat, { q, answer }]);
    setQuestion('');
  };

  return (
    <main>
      <header className="hero">
        <div className="badge">💧 SOCIAL BENEFIT • AI AGENT</div>
        <h1>AquaSave <span>AI</span></h1>
        <p>Understand your household water use, detect possible wastage and get a personalized saving plan.</p>
      </header>

      <section className="grid">
        <div className="card form-card">
          <h2>Household Profile</h2>
          <p className="muted">Enter approximate daily/weekly usage. Results are estimates.</p>

          <label>People in household
            <input type="number" min="1" value={data.people} onChange={e => update('people', e.target.value)} />
          </label>

          <div className="two">
            <label>Showers / day
              <input type="number" min="0" value={data.showers} onChange={e => update('showers', e.target.value)} />
            </label>
            <label>Minutes / shower
              <input type="number" min="0" value={data.showerMinutes} onChange={e => update('showerMinutes', e.target.value)} />
            </label>
          </div>

          <label>Toilet uses / day
            <input type="number" min="0" value={data.toiletUses} onChange={e => update('toiletUses', e.target.value)} />
          </label>

          <label>Washing-machine loads / week
            <input type="number" min="0" value={data.washingLoads} onChange={e => update('washingLoads', e.target.value)} />
          </label>

          <div className="two">
            <label>Kitchen water / day (L)
              <input type="number" min="0" value={data.kitchenLitres} onChange={e => update('kitchenLitres', e.target.value)} />
            </label>
            <label>Garden water / day (L)
              <input type="number" min="0" value={data.gardenLitres} onChange={e => update('gardenLitres', e.target.value)} />
            </label>
          </div>

          <label>Possible leakage
            <select value={data.leakage} onChange={e => update('leakage', e.target.value)}>
              <option value="none">No known leak</option>
              <option value="small">Small leak</option>
              <option value="large">Large leak</option>
            </select>
          </label>

          <button onClick={analyze}>Analyze My Water Use →</button>
        </div>

        <div className="card result-card">
          {!result ? (
            <div className="empty">
              <div className="drop">💧</div>
              <h2>Your AI report will appear here</h2>
              <p>Fill in the household profile and click Analyze.</p>
            </div>
          ) : (
            <>
              <div className="result-head">
                <div><span className="eyebrow">AI ANALYSIS</span><h2>Water Impact Report</h2></div>
                <div className="score">{result.score}<small>/100</small><span>water score</span></div>
              </div>

              <div className="stats">
                <div><b>{result.total} L</b><span>estimated / day</span></div>
                <div><b>{result.perPerson} L</b><span>per person / day</span></div>
                <div><b>~{result.savings} L</b><span>possible daily saving</span></div>
              </div>

              <div className="notice">⚠️ <b>Focus areas:</b> {data.leakage !== 'none' ? 'leakage, ' : ''}{data.showerMinutes > 7 ? 'shower duration, ' : ''}{data.gardenLitres > 50 ? 'garden watering' : 'daily habits'}</div>

              <h3>Personalized Saving Plan</h3>
              <ul>{result.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>

              <div className="impact">
                <span>🎯 30-day potential</span>
                <b>{(result.savings * 30).toLocaleString()} L</b>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="card agent-card">
        <div>
          <span className="eyebrow">ASK THE AGENT</span>
          <h2>💬 AquaSave Assistant</h2>
          <p className="muted">Ask a question using the household profile you entered.</p>
        </div>
        <div className="chatbox">
          {chat.map((m, i) => (
            <div key={i} className="conversation">
              <div className="userq">You: {m.q}</div>
              <div className="agent">🤖 {m.answer}</div>
            </div>
          ))}
          <div className="askrow">
            <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAgent()} placeholder="e.g. How can I save water while showering?" />
            <button onClick={askAgent}>Ask</button>
          </div>
        </div>
      </section>

      <footer>Built for AI AGENT BUILD CHALLENGE • AquaSave AI • Estimates only; actual use depends on fixtures and behavior.</footer>
    </main>
  );
}
