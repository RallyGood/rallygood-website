// Shop generator. Reads config/shop.json and returns HTML for the shop page,
// each product page and the homepage block. No dependencies.
import fs from 'node:fs';
import path from 'node:path';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '£' + (Number.isInteger(n) ? String(n) : n.toFixed(2));
const money2 = (n) => '£' + n.toFixed(2);
const r2 = (n) => Math.round(n * 100) / 100;

export function loadShop(root, cfg) {
  const shop = JSON.parse(fs.readFileSync(path.join(root, 'config/shop.json'), 'utf8'));
  const live = cfg.shopStatus === 'live';
  const registered = cfg.registrationStatus === 'registered';

  // ---- Safety gate: the shop cannot go live with sample content ----
  const problems = [];
  if (!['preview', 'live'].includes(cfg.shopStatus)) problems.push(`site.config.json shopStatus must be "preview" or "live" (got "${cfg.shopStatus}")`);
  for (const p of shop.products) {
    const totalCosts = r2(p.costs.reduce((s, c) => s + c[1], 0));
    if (totalCosts >= p.price) problems.push(`${p.slug}: direct costs (${money2(totalCosts)}) are not below the price (${money2(p.price)})`);
    for (const c of p.colourways) {
      if (!fs.existsSync(path.join(root, 'src', c.image))) problems.push(`${p.slug}: image missing ${c.image}`);
    }
    if (!shop.groups.some((g) => g.id === p.group)) problems.push(`${p.slug}: unknown group ${p.group}`);
  }
  if (live) {
    if (!registered) problems.push('shopStatus is "live" but registrationStatus is not "registered"');
    for (const p of shop.products) {
      if (p.detailsStatus !== 'confirmed') problems.push(`${p.slug}: detailsStatus is "${p.detailsStatus}", must be "confirmed"`);
      if (p.imagesStatus !== 'confirmed') problems.push(`${p.slug}: imagesStatus is "${p.imagesStatus}", must be "confirmed"`);
      if (!p.checkoutUrl || !/^https:\/\//.test(p.checkoutUrl)) problems.push(`${p.slug}: checkoutUrl must be an https:// link`);
    }
  }
  if (problems.length) throw new Error('Shop config problems:\n - ' + problems.join('\n - '));

  const isSample = (p) => !live && (p.detailsStatus !== 'confirmed' || p.imagesStatus !== 'confirmed');
  const statusPill = (p) => (live ? '' : `<span class="status-pill planned">${p.dropEdition ? 'Concept' : 'Coming soon'}</span>`);
  const url = (p) => `/shop/${p.slug}.html`;
  const groupItems = (id) => shop.products.filter((p) => p.group === id);

  const card = (p) => `
          <article class="shop-card">
            <a class="shop-card-img" href="${url(p)}" tabindex="-1" aria-hidden="true"><img src="${esc(p.colourways[0].image)}" alt="" width="900" height="900" loading="lazy"></a>
            <div class="card-topline"><span class="tag">${esc(p.tag)}</span>${statusPill(p)}</div>
            <h3><a href="${url(p)}">${esc(p.name)}</a></h3>
            <p class="shop-price">${live ? '' : 'Planned price '}${money(p.price)}${live ? '' : ' <small>(provisional)</small>'}</p>
            <p>${esc(p.blurb)}</p>
            <a class="button button-light full" href="${url(p)}">View details</a>
          </article>`;

  const sampleNotice = `
        <div class="notice-card notice-top">
          <span>Sample content</span>
          <p>Photos are illustrated mock-ups, and sizes, materials, costs and delivery details are sample figures. They will be replaced with real, confirmed details before the shop opens.</p>
        </div>`;

  function indexContent() {
    const groups = shop.groups.map((g) => `
        <div class="shop-group" id="${g.id === 'drop' ? 'drop-editions' : g.id}">
          <div class="shop-group-head"><h2>${esc(g.title)}</h2><p>${esc(g.blurb)}</p></div>
          <div class="shop-grid">${groupItems(g.id).map(card).join('')}
          </div>
        </div>`).join('');
    return `
    <section class="page-hero section-soft">
      <div class="shell">
        <p class="eyebrow">Shop</p>
        <h1>Wear it. Carry it. Rally good.</h1>
        <p class="lead-small">${live
          ? 'RallyGood merchandise. Every product page shows what it costs to make and what is left for our charitable work.'
          : 'We are preparing a small RallyGood shop. <strong>Nothing is on sale yet and we cannot take orders.</strong> The products below are samples, so you can see what is planned.'}</p>
      </div>
    </section>

    <section class="section">
      <div class="shell">${live ? '' : sampleNotice}
${groups}
      </div>
    </section>

    <section class="section section-soft">
      <div class="shell">
        <div class="section-heading wide">
          <p class="eyebrow">Where the money goes</p>
          <h2>A purchase is not a donation.</h2>
          <p>Every product page shows the price, what it costs to make and send, and how much is left for RallyGood's charitable work.</p>
        </div>
        <div class="check-grid">
          <div class="check-item">Price, direct costs and the amount left for RallyGood, shown separately</div>
          <div class="check-item">For Drop editions, the exact amount or formula going to the named Drop</div>
          <div class="check-item">No “100% goes to charity” claims unless we can prove them</div>
          <div class="check-item">Any optional donation kept separate from the purchase</div>
          <div class="check-item">Delivery, returns and your legal rights set out before you buy</div>
          <div class="check-item">Photographs, measurements and materials for every item</div>
        </div>
        <div class="notice-card">
          <span>Please note</span>
          <p>The 85% / 15% split on our <a class="text-link" href="/how-it-works.html">How it works</a> page describes donations to Drops. Shop income is different: it has its own costs, and each product page shows its figures.</p>
        </div>
      </div>
    </section>
${live ? '' : `
    <section class="section">
      <div class="shell">
        <div class="section-heading wide">
          <p class="eyebrow">Before we open</p>
          <h2>What has to happen first</h2>
        </div>
        <div class="check-grid">
          <div class="check-item">Charity registration completed</div>
          <div class="check-item">Samples approved, washed and measured</div>
          <div class="check-item">Supplier costs and delivery confirmed</div>
          <div class="check-item">Payments, returns and privacy arrangements in place</div>
          <div class="check-item">Trustees' approval of how we trade</div>
          <div class="check-item">Funding information for each item published</div>
        </div>
        <p class="center-note"><a class="button button-primary" href="/contact.html?topic=shop">Tell me when the shop opens</a></p>
      </div>
    </section>`}`;
  }

  function productContent(p) {
    const costs = p.costs;
    const direct = r2(costs.reduce((s, c) => s + c[1], 0));
    const left = r2(p.price - direct);
    const gallery = p.colourways.length > 1
      ? `<div class="gallery-thumbs" role="group" aria-label="Colourways">${p.colourways.map((c, i) => `<button type="button" class="gallery-thumb${i === 0 ? ' active' : ''}" data-image="${esc(c.image)}" data-alt="${esc(c.alt)}" data-colour="${esc(c.id)}" aria-label="${esc(c.name)}" aria-pressed="${i === 0}"><img src="${esc(c.image)}" alt="" width="120" height="120" loading="lazy"></button>`).join('')}</div>`
      : '';
    const colourSelect = p.colourways.length > 1
      ? `<div class="field"><label for="opt-colour">Colourway</label><select id="opt-colour" name="colour">${p.colourways.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></div>`
      : `<p class="shop-note"><strong>Colour:</strong> ${esc(p.colourways[0].name)}</p>`;
    const sizeSelect = p.sizes.length > 1
      ? `<div class="field"><label for="opt-size">Size</label><select id="opt-size" name="size">${p.sizes.map((s) => `<option>${esc(s)}</option>`).join('')}</select></div>`
      : `<p class="shop-note"><strong>Size:</strong> ${esc(p.sizes[0])}</p>`;
    const buy = live
      ? `<a class="button button-primary full" href="${esc(p.checkoutUrl)}" rel="noopener">Buy merchandise</a>
          <p class="shop-note">${esc(shop.policies.donation)}</p>`
      : `<button class="button button-primary full" type="button" disabled aria-disabled="true" aria-describedby="buy-note">Buy merchandise</button>
          <p class="shop-note" id="buy-note">Not available yet. Orders open after RallyGood's charity registration is complete. <a class="text-link" href="/contact.html?topic=shop">Tell me when the shop opens</a></p>`;
    const sizeTable = p.sizeGuide
      ? `<h3>Size guide</h3>
          <p class="shop-note">${esc(shop.sizeGuide.note)}</p>
          <div class="table-wrap table-small" tabindex="0" aria-label="Size guide"><table><thead><tr>${shop.sizeGuide.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${shop.sizeGuide.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`
      : '';
    const sample = isSample(p);
    return `
    <section class="section product-section">
      <div class="shell">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/shop.html">Shop</a> <span aria-hidden="true">/</span> <span>${esc(p.name)}</span></nav>${sample ? sampleNotice.replace('notice-card notice-top', 'notice-card notice-top product-notice') : ''}
        <div class="product-grid">
          <div class="product-gallery" data-gallery>
            <img class="product-main" src="${esc(p.colourways[0].image)}" alt="${esc(p.colourways[0].alt)}" width="900" height="900">
            ${gallery}
          </div>
          <div class="product-info">
            <div class="card-topline"><span class="tag">${esc(p.tag)}</span>${statusPill(p)}</div>
            <h1>${esc(p.name)}</h1>
            <p class="product-price">${live ? '' : 'Planned price '}${money(p.price)}${live ? '' : ' <small>(provisional, excl. delivery)</small>'}</p>
            ${p.description.map((d) => `<p>${esc(d)}</p>`).join('\n            ')}
            <form class="product-form" onsubmit="return false" aria-label="Choose options">
              ${colourSelect}
              ${sizeSelect}
              ${buy}
            </form>
            <p class="shop-note"><strong>Made:</strong> ${esc(p.made)} <strong>Dispatch:</strong> ${esc(p.dispatch)}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="shell product-detail-grid">
        <div class="detail-card" id="money">
          <h2>Where your money goes</h2>
          <p>${live ? 'How the price of this item is used.' : 'Estimated breakdown (sample figures, to be replaced with real costs).'}</p>
          <div class="table-wrap table-small" tabindex="0" aria-label="Where your money goes"><table>
            <caption class="sr-only">Breakdown of the ${money(p.price)} price</caption>
            <tbody>
              <tr><th scope="row">Price paid (excluding delivery)</th><td>${money2(p.price)}</td></tr>
              ${costs.map((c) => `<tr><th scope="row" class="cost-row">${esc(c[0])}</th><td>−${money2(c[1])}</td></tr>`).join('\n              ')}
              <tr class="total-row"><th scope="row">Left after direct costs${live ? '' : ' (estimated)'}</th><td>${money2(left)}</td></tr>
            </tbody>
          </table></div>
          <p class="shop-note">${esc(p.funding)}</p>
          <p class="shop-note">${esc(shop.policies.donation)}</p>
        </div>
        <div class="detail-card">
          <h2>Details</h2>
          <dl class="spec-list">${p.specs.map((s) => `<div><dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl>
          ${sizeTable}
        </div>
        <div class="detail-card">
          <h2>Delivery</h2>
          <ul class="plain-list">${shop.policies.delivery.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
          <h3>Production</h3>
          <p>${esc(p.made)} ${esc(p.dispatch)}</p>
        </div>
        <div class="detail-card">
          <h2>Returns</h2>
          <ul class="plain-list">${shop.policies.returns.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
          <p class="shop-note">Questions? <a class="text-link" href="/contact.html">Get in touch</a> or email <a class="text-link" href="mailto:{{EMAIL}}">{{EMAIL}}</a>.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell">
        <div class="section-heading wide"><h2>More from the shop</h2></div>
        <div class="shop-grid">${shop.products.filter((o) => o.slug !== p.slug).slice(0, 3).map(card).join('')}
        </div>
        <p class="center-note"><a class="text-link" href="/shop.html">See the whole shop →</a></p>
      </div>
    </section>`;
  }

  // Homepage block: core tee, pin, and a Drop-edition card (neutral between Drop tees).
  function homeBlock() {
    const core = shop.products.find((p) => p.slug === 'core-tee');
    const pin = shop.products.find((p) => p.slug === 'pin');
    const drops = groupItems('drop');
    const dropCard = drops.length ? `
          <article class="shop-card">
            <a class="shop-card-img duo" href="/shop.html#drop-editions" tabindex="-1" aria-hidden="true">${drops.slice(0, 2).map((d) => `<img src="${esc(d.colourways[0].image)}" alt="" width="900" height="900" loading="lazy">`).join('')}</a>
            <div class="card-topline"><span class="tag">Drop editions</span>${live ? '' : '<span class="status-pill planned">Concept</span>'}</div>
            <h3><a href="/shop.html#drop-editions">Limited Drop T-shirts</a></h3>
            <p class="shop-price">${live ? '' : 'Planned price '}${money(drops[0].price)}${live ? '' : ' <small>(provisional)</small>'}</p>
            <p>Time-boxed tees linked to a specific Drop, with the funding shown on each page.</p>
            <a class="button button-light full" href="/shop.html#drop-editions">See Drop editions</a>
          </article>` : '';
    return `<section class="section" id="shop">
      <div class="shell">
        <div class="section-heading wide">
          <p class="eyebrow">Shop${live ? '' : ' · coming soon'}</p>
          <h2>Wear it. Carry it. Rally good.</h2>
          <p>${live ? 'RallyGood merchandise, with the costs shown on every page.' : 'Our merchandise shop is being set up and is not open yet. These are samples of what is planned.'}</p>
        </div>
        <div class="shop-grid">${card(core)}${card(pin)}${dropCard}
        </div>
        <p class="center-note"><a class="text-link" href="/shop.html">Visit the shop →</a></p>
      </div>
    </section>`;
  }

  return { shop, live, url, indexContent, productContent, homeBlock };
}
