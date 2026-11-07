// Shared components for the static build. Everything here reads from config/content.json so wording lives in one place.
import fs from 'node:fs';
import path from 'node:path';

export function loadContent(root, env = process.env) {
  const c = JSON.parse(fs.readFileSync(path.join(root, 'config/content.json'), 'utf8'));
  const preview = env.PREVIEW === '1';
  // The override is only honoured for a private preview build, never for a normal production build.
  if (preview && (env.ISLAMIC_GIVING_RELEASED === 'true' || env.ISLAMIC_GIVING_RELEASED === 'false')) {
    c.islamicGivingReleased = env.ISLAMIC_GIVING_RELEASED === 'true';
  }
  if (typeof c.islamicGivingReleased !== 'boolean') throw new Error('content.json: islamicGivingReleased must be true or false');
  const a = c.allocation;
  if (a.dropPercent + a.opsPercent !== 100) throw new Error('content.json: allocation percentages must add up to 100');
  c.preview = preview;
  return c;
}

const gbp2 = (n) => '£' + n.toFixed(2);

export function makeComponents(c, esc, drops) {
  const a = c.allocation;
  const n = c.notices;
  const barLabel = `Planned allocation of a standard Drop donation. ${a.dropPercent}% goes to the Drop fund. ${a.opsPercent}% goes to ${a.opsLabel.toLowerCase()}.`;
  const bar = `<div class="alloc-bar" role="img" aria-label="${esc(barLabel)}" data-alloc-bar><span class="alloc-seg alloc-seg-drop" style="flex-basis:${a.dropPercent}%" data-seg="drop">${a.dropPercent}%</span><span class="alloc-seg alloc-seg-ops" style="flex-basis:${a.opsPercent}%" data-seg="ops">${a.opsPercent}%</span></div>`;
  const links = `<p class="alloc-links"><a class="text-link" href="${a.policyHref}">${esc(a.policyLinkText)}</a><a class="text-link" href="${a.dropsHref}">${esc(a.dropsLinkText)}</a></p>`;

  const allocation = `<section class="section alloc-section" id="allocation" aria-labelledby="alloc-heading">
      <div class="shell alloc" data-alloc>
        <h2 id="alloc-heading">${esc(a.heading)}</h2>
        <p class="lead-small">${esc(a.intro)}</p>
        ${bar}
        <div class="alloc-controls" role="group" aria-label="Highlight a part of the allocation">
          <button type="button" class="alloc-btn" data-seg="drop" aria-pressed="false" aria-controls="alloc-drop-text"><span class="alloc-tick" aria-hidden="true"></span>${a.dropPercent}p: ${esc(a.dropLabel)}</button>
          <button type="button" class="alloc-btn" data-seg="ops" aria-pressed="false" aria-controls="alloc-ops-text"><span class="alloc-tick" aria-hidden="true"></span>${a.opsPercent}p: ${esc(a.opsLabel)}</button>
        </div>
        <div class="alloc-explain">
          <div class="alloc-card alloc-card-drop" id="alloc-drop-text" data-seg="drop"><strong class="alloc-amount">${a.dropPercent}p</strong><p>${esc(a.dropText)}</p></div>
          <div class="alloc-card alloc-card-ops" id="alloc-ops-text" data-seg="ops"><strong class="alloc-amount">${a.opsPercent}p</strong><p>${esc(a.canonical15)}</p></div>
        </div>
        <p class="alloc-purpose">${esc(a.sharedPurpose)}</p>
        ${links}
        <p class="small-print">${esc(a.supportingNote)}</p>
      </div>
    </section>`;

  const ex = a.exampleAmount;
  const exOps = Math.round(ex * a.opsPercent) / 100;
  const exampleLine = `<p class="small-print alloc-example">Illustration only, not a donation form: ${gbp2(ex)} would be planned as ${gbp2(ex - exOps)} to the Drop fund and ${gbp2(exOps)} to the ${a.opsPercent}%.</p>`;

  const allocationCompact = (withExample = false) => `<div class="alloc alloc-compact" data-alloc-compact>
          <p class="alloc-compact-note"><strong>${esc(a.supportingNote)}</strong></p>
          ${bar}
          <div class="alloc-explain">
            <div class="alloc-card alloc-card-drop"><strong class="alloc-amount">${a.dropPercent}p</strong><p>${esc(a.dropText)}</p></div>
            <div class="alloc-card alloc-card-ops"><strong class="alloc-amount">${a.opsPercent}p</strong><p>${esc(a.canonical15)}</p></div>
          </div>
          ${withExample ? exampleLine : ''}
          ${links}
        </div>`;

  const policySection = `<section class="section section-soft" id="allocation-policy" aria-labelledby="policy-heading">
      <div class="shell prose-grid">
        <div class="prose">
          <h2 id="policy-heading">Allocation policy</h2>
          <p>Planned standard allocation: ${a.dropPercent}% of a standard Drop donation to the Drop fund and ${a.opsPercent}% to supporting work. This is a plan. It is not a report of actual spending.</p>
          <p>${esc(a.canonical15)}</p>
          <p>The Drop fund covers practical essentials and delivery costs identified in the relevant Drop budget. The ${a.opsPercent}% covers the supporting work described above. We do not count the same cost in both.</p>
          <p>Fundraising and general operating costs are part of the ${a.opsPercent}%. They are not represented as direct delivery expenditure.</p>
          <p>${esc(a.specialistNote)}</p>
          <p>Actual spending will be reported separately, dated and supported by accounting figures, once there is spending to report.</p>
        </div>
      </div>
    </section>`;

  // Development-status notices
  const inDev = `<p class="status-note"><span class="status-pill planned">In development</span> ${esc(n.inDevelopment)}</p>`;

  // Giving-option card
  const givingCard = ({ title, text, href, status }) => {
    const pill = status === 'demo' ? '<span class="status-pill planned">Demonstration available</span>' : '<span class="status-pill planned">In development</span>';
    const body = `<div class="card-topline">${pill}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>`;
    return href
      ? `<article class="give-card${status === 'demo' ? '' : ' give-card-dev'}">${body}<a class="button button-light full" href="${href}">${status === 'demo' ? 'View ' + esc(title) : 'Read the notice'}</a></article>`
      : `<article class="give-card give-card-dev">${body}</article>`;
  };
  const giveCardsPage = (cards) => `<div class="give-grid">${cards.map(givingCard).join('')}</div>`;

  // Demo donation form (no <form> element, no field names: nothing can be submitted, stored or sent)
  const demoForm = ({ id, mode, heading }) => {
    const presets = c.exampleAmounts.map((v, i) => `<button type="button" class="demo-amount${v === 25 ? ' active' : ''}" data-amount="${v}" aria-pressed="${v === 25}">£${v}</button>`).join('');
    let purpose = '';
    if (mode === 'sadaqah') {
      purpose = `<label for="${id}-purpose">Purpose</label><select id="${id}-purpose" data-demo-purpose><option value="the rolling essentials fund across approved Drops">Rolling essentials fund (across approved Drops)</option>${drops.map((d) => `<option value="${esc(d.title)} (example Drop)">${esc(d.title)} (example Drop)</option>`).join('')}</select>`;
    }
    let summaryLines = '';
    if (mode === 'monthly') summaryLines = 'Frequency: monthly. Purpose: a rolling essentials fund allocated across approved Drops.';
    if (mode === 'friday') summaryLines = 'Frequency: weekly, every Friday. Start date to be confirmed. Purpose: a rolling essentials fund allocated across approved Drops.';
    if (mode === 'ramadan') summaryLines = 'Daily gift during Ramadan. Number of days and payment method to be confirmed. Purpose: the next Ramadan campaign.';
    if (mode === 'sadaqah') summaryLines = 'Frequency: one gift.';
    const amountLegend = mode === 'ramadan' ? 'Example daily amount (sample figures)' : 'Example amount (sample figures)';
    const presetsHtml = mode === 'ramadan'
      ? [1, 2, 5].map((v) => `<button type="button" class="demo-amount${v === 1 ? ' active' : ''}" data-amount="${v}" aria-pressed="${v === 1}">£${v} a day</button>`).join('')
      : presets;
    const defAmt = mode === 'ramadan' ? 1 : 25;
    return `<div class="demo-form" id="${id}" data-demo="${mode}" data-per="${mode === 'ramadan' ? ' a day' : ''}">
          <p class="demo-banner" role="note"><strong>${esc(n.demoBanner)}</strong></p>
          <noscript><p class="small-print">This demonstration needs JavaScript to preview. Nothing is taken or sent either way.</p></noscript>
          <h3 id="${id}-h">${esc(heading)}</h3>
          <fieldset class="demo-fieldset"><legend>${amountLegend}</legend><div class="amount-grid demo-amounts">${presetsHtml}</div></fieldset>
          <label for="${id}-custom">Other amount (£)</label>
          <input id="${id}-custom" type="number" inputmode="decimal" min="1" step="any" value="${defAmt}" data-demo-custom>
          ${purpose}
          <p class="small-print demo-summary-static">${esc(summaryLines)}</p>
          <p class="demo-error" role="alert" hidden>Enter an amount of £1 or more to preview.</p>
          <button type="button" class="button button-primary" data-demo-submit>${esc(n.demoSubmit)}</button>
          <div class="demo-confirm" role="status" aria-live="polite" hidden>
            <p class="demo-badge">Demonstration</p>
            <strong>${esc(n.demoConfirmTitle)}</strong>
            <p data-demo-result></p>
            <p class="small-print">${esc(n.demoConfirmBody)}</p>
          </div>
        </div>`;
  };

  // Ways to Give navigation (Islamic Giving only when released)
  const waysItems = [['Support a Drop', '/drops.html'], ['Give Monthly', '/give-monthly.html']];
  if (c.islamicGivingReleased) waysItems.push(['Islamic Giving', '/islamic-giving.html']);
  const navWays = waysItems.map(([t, h]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('');

  return { allocation, allocationCompact, policySection, inDev, givingCard, giveCardsPage, demoForm, navWays, bar };
}
