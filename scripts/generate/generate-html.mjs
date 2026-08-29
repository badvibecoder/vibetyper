#!/usr/bin/env node
// generate-html.mjs
// Generates the vibetyper HTML dictionary: realistic, self-contained HTML
// snippets (nav, forms, cards, tables, sections, components...) written in
// "blank" split mode — every block is contiguous (no blank lines inside) and
// blocks are separated by a blank line.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../../dictionary/html');
fs.mkdirSync(OUT, { recursive: true });

const blocks = [];
const add = (tpl, variants, family = 'misc') => {
  for (const v of variants) {
    const text = tpl(v).trim().replace(/\n[ \t]*\n+/g, '\n');
    if (!text) continue;
    blocks.push({ text, family });
  }
};

// ===========================================================================
// Navigation
// ===========================================================================
add(({ brand, links }) => `<nav class="site-nav" aria-label="Primary">
  <a class="brand" href="/">${brand}</a>
  <ul class="nav-links">
    ${links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('\n    ')}
  </ul>
  <a class="btn btn-primary" href="/get-started">Get started</a>
</nav>`, [
  { brand: 'Northwind Docs', links: [{ href: '/docs', label: 'Documentation' }, { href: '/guides', label: 'Guides' }, { href: '/api', label: 'API Reference' }, { href: '/changelog', label: 'Changelog' }] },
  { brand: 'Drift Analytics', links: [{ href: '/product', label: 'Product' }, { href: '/pricing', label: 'Pricing' }, { href: '/customers', label: 'Customers' }, { href: '/blog', label: 'Blog' }] },
], 'nav');

add(({ store, cartCount }) => `<nav class="store-nav" aria-label="Store">
  <a class="brand" href="/">${store}</a>
  <ul class="nav-links">
    <li><a href="/new-arrivals">New arrivals</a></li>
    <li><a href="/women">Women</a></li>
    <li><a href="/men">Men</a></li>
    <li><a href="/sale">Sale</a></li>
  </ul>
  <a class="cart-link" href="/cart" aria-label="Cart with ${cartCount} items">
    Cart (${cartCount})
  </a>
</nav>`, [
  { store: 'Harbor & Co.', cartCount: 3 },
  { store: 'Fern & Field', cartCount: 0 },
], 'nav');

add(() => `<nav class="app-nav" aria-label="Dashboard">
  <a class="brand" href="/dashboard">Acme Cloud</a>
  <ul class="nav-links">
    <li><a href="/dashboard">Overview</a></li>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/deployments">Deployments</a></li>
    <li><a href="/logs">Logs</a></li>
  </ul>
  <div class="user-menu">
    <img src="/avatars/alice.png" alt="Alice Nguyen" width="32" height="32">
    <span>Alice Nguyen</span>
  </div>
</nav>`, [
  {},
], 'nav');

add(({ site }) => `<nav class="blog-nav" aria-label="Blog">
  <a class="brand" href="/">${site}</a>
  <ul class="nav-links">
    <li><a href="/engineering">Engineering</a></li>
    <li><a href="/product">Product</a></li>
    <li><a href="/company">Company</a></li>
    <li><a href="/newsletter">Newsletter</a></li>
  </ul>
  <form class="search-form" role="search" action="/search">
    <input type="search" name="q" placeholder="Search posts" aria-label="Search posts">
  </form>
</nav>`, [
  { site: 'The Daily Byte' },
  { site: 'Craft & Code' },
], 'nav');

add(() => `<nav class="site-nav" aria-label="Main navigation">
  <a class="brand" href="/">Bluebird Coffee</a>
  <ul class="nav-links">
    <li><a href="/menu">Menu</a></li>
    <li><a href="/about">Our story</a></li>
    <li><a href="/locations">Locations</a></li>
    <li><a href="/beans">Buy beans</a></li>
  </ul>
  <a class="btn" href="/reserve">Reserve a table</a>
</nav>`, [
  {},
], 'nav');

add(({ airline }) => `<nav class="airline-nav" aria-label="Travel">
  <a class="brand" href="/">${airline}</a>
  <ul class="nav-links">
    <li><a href="/flights">Flights</a></li>
    <li><a href="/hotels">Hotels</a></li>
    <li><a href="/cars">Car hire</a></li>
    <li><a href="/trips">My trips</a></li>
  </ul>
  <a class="btn btn-accent" href="/check-in">Check in</a>
</nav>`, [
  { airline: 'Aurora Air' },
  { airline: 'Meridian Airways' },
], 'nav');

add(() => `<nav class="bank-nav" aria-label="Banking">
  <a class="brand" href="/">Crestline Bank</a>
  <ul class="nav-links">
    <li><a href="/accounts">Accounts</a></li>
    <li><a href="/transfers">Transfers</a></li>
    <li><a href="/cards">Cards</a></li>
    <li><a href="/payments">Payments</a></li>
  </ul>
  <a class="btn" href="/security">Security</a>
</nav>`, [
  {},
], 'nav');

add(({ name }) => `<nav class="campus-nav" aria-label="Campus">
  <a class="brand" href="/">${name}</a>
  <ul class="nav-links">
    <li><a href="/admissions">Admissions</a></li>
    <li><a href="/academics">Academics</a></li>
    <li><a href="/research">Research</a></li>
    <li><a href="/campus-life">Campus life</a></li>
    <li><a href="/alumni">Alumni</a></li>
  </ul>
</nav>`, [
  { name: 'Riverbend University' },
  { name: 'Westgate College' },
], 'nav');

add(() => `<nav class="gym-nav" aria-label="Membership">
  <a class="brand" href="/">Summit Fitness</a>
  <ul class="nav-links">
    <li><a href="/classes">Classes</a></li>
    <li><a href="/trainers">Trainers</a></li>
    <li><a href="/membership">Membership</a></li>
    <li><a href="/schedule">Schedule</a></li>
  </ul>
  <a class="btn btn-primary" href="/join">Join now</a>
</nav>`, [
  {},
], 'nav');

add(() => `<nav class="sub-nav" aria-label="Section">
  <ol class="breadcrumb">
    <li><a href="/docs">Docs</a></li>
    <li><a href="/docs/guides">Guides</a></li>
    <li aria-current="page">Deployment</li>
  </ol>
  <ul class="quick-links">
    <li><a href="#prereqs">Prerequisites</a></li>
    <li><a href="#steps">Steps</a></li>
    <li><a href="#troubleshoot">Troubleshooting</a></li>
  </ul>
</nav>`, [
  {},
], 'nav');

// ===========================================================================
// Forms
// ===========================================================================
add(() => `<form class="auth-form" action="/login" method="post">
  <h1>Sign in</h1>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required autocomplete="email">
  <label for="password">Password</label>
  <input type="password" id="password" name="password" required autocomplete="current-password">
  <button type="submit" class="btn btn-primary">Sign in</button>
  <p class="form-foot">New here? <a href="/signup">Create an account</a></p>
</form>`, [
  {},
], 'forms');

add(() => `<form class="auth-form" action="/signup" method="post">
  <h1>Create your account</h1>
  <label for="full-name">Full name</label>
  <input type="text" id="full-name" name="name" required autocomplete="name">
  <label for="work-email">Work email</label>
  <input type="email" id="work-email" name="email" required autocomplete="email">
  <label for="new-password">Password</label>
  <input type="password" id="new-password" name="password" minlength="10" required>
  <p class="hint">Use at least 10 characters.</p>
  <button type="submit" class="btn btn-primary">Sign up</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="auth-form" action="/forgot" method="post">
  <h1>Reset your password</h1>
  <p>Enter the email address you used to register and we will send you a reset link.</p>
  <label for="reset-email">Email</label>
  <input type="email" id="reset-email" name="email" required autocomplete="email">
  <button type="submit" class="btn btn-primary">Send reset link</button>
  <p class="form-foot"><a href="/login">Back to sign in</a></p>
</form>`, [
  {},
], 'forms');

add(() => `<form class="checkout-form" action="/checkout" method="post">
  <fieldset>
    <legend>Billing address</legend>
    <label for="addr-line1">Address line 1</label>
    <input type="text" id="addr-line1" name="line1" required>
    <label for="addr-city">City</label>
    <input type="text" id="addr-city" name="city" required>
    <label for="addr-zip">Postal code</label>
    <input type="text" id="addr-zip" name="zip" required inputmode="numeric">
    <label for="addr-country">Country</label>
    <select id="addr-country" name="country" required>
      <option value="US">United States</option>
      <option value="CA">Canada</option>
      <option value="GB">United Kingdom</option>
      <option value="DE">Germany</option>
    </select>
  </fieldset>
  <button type="submit" class="btn btn-primary">Continue to payment</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="contact-form" action="/contact" method="post">
  <h2>Contact support</h2>
  <label for="topic">Topic</label>
  <select id="topic" name="topic" required>
    <option value="billing">Billing</option>
    <option value="account">Account access</option>
    <option value="bug">Bug report</option>
    <option value="other">Something else</option>
  </select>
  <label for="message">Message</label>
  <textarea id="message" name="message" rows="5" required placeholder="Describe the issue..."></textarea>
  <button type="submit" class="btn btn-primary">Send message</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="newsletter-form" action="/subscribe" method="post">
  <label for="newsletter-email">Email address</label>
  <input type="email" id="newsletter-email" name="email" required placeholder="you@example.com">
  <button type="submit" class="btn">Subscribe</button>
  <p class="hint">Monthly digest. No spam, unsubscribe anytime.</p>
</form>`, [
  {},
], 'forms');

add(({ query }) => `<form class="filter-form" action="/search" method="get" role="search">
  <label for="q">Search</label>
  <input type="search" id="q" name="q" value="${query}" placeholder="Search products">
  <fieldset>
    <legend>Category</legend>
    <label><input type="checkbox" name="cat" value="audio"> Audio</label>
    <label><input type="checkbox" name="cat" value="wearables"> Wearables</label>
    <label><input type="checkbox" name="cat" value="home"> Home</label>
  </fieldset>
  <label for="sort">Sort by</label>
  <select id="sort" name="sort">
    <option value="relevance">Relevance</option>
    <option value="price-asc">Price: low to high</option>
    <option value="price-desc">Price: high to low</option>
  </select>
  <button type="submit" class="btn">Apply filters</button>
</form>`, [
  { query: 'wireless headphones' },
  { query: 'desk lamp' },
], 'forms');

add(() => `<form class="profile-form" action="/profile" method="post">
  <h2>Edit profile</h2>
  <label for="display-name">Display name</label>
  <input type="text" id="display-name" name="display_name" value="Priya Sharma" required>
  <label for="bio">Bio</label>
  <textarea id="bio" name="bio" rows="3" maxlength="280">Full-stack developer, coffee enthusiast.</textarea>
  <label for="timezone">Timezone</label>
  <select id="timezone" name="timezone">
    <option value="America/Los_Angeles">Pacific Time</option>
    <option value="America/New_York">Eastern Time</option>
    <option value="Europe/London" selected>London</option>
    <option value="Asia/Kolkata">India Standard Time</option>
  </select>
  <button type="submit" class="btn btn-primary">Save changes</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="booking-form" action="/booking" method="post">
  <h2>Book your stay</h2>
  <label for="checkin">Check-in</label>
  <input type="date" id="checkin" name="checkin" required>
  <label for="checkout">Check-out</label>
  <input type="date" id="checkout" name="checkout" required>
  <label for="guests">Guests</label>
  <select id="guests" name="guests">
    <option>1 adult</option>
    <option selected>2 adults</option>
    <option>2 adults, 1 child</option>
    <option>3 adults</option>
  </select>
  <button type="submit" class="btn btn-primary">Check availability</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="feedback-form" action="/feedback" method="post">
  <h2>How was your experience?</h2>
  <fieldset>
    <legend>Rating</legend>
    <label><input type="radio" name="rating" value="1"> 1 star</label>
    <label><input type="radio" name="rating" value="2"> 2 stars</label>
    <label><input type="radio" name="rating" value="3"> 3 stars</label>
    <label><input type="radio" name="rating" value="4"> 4 stars</label>
    <label><input type="radio" name="rating" value="5" checked> 5 stars</label>
  </fieldset>
  <label for="feedback">Comments</label>
  <textarea id="feedback" name="comments" rows="4"></textarea>
  <button type="submit" class="btn btn-primary">Submit feedback</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="upload-form" action="/upload" method="post" enctype="multipart/form-data">
  <h2>Upload documents</h2>
  <label for="docs">Files</label>
  <input type="file" id="docs" name="docs" multiple accept=".pdf,.docx,.png,.jpg" required>
  <p class="hint">PDF, Word, PNG or JPG up to 25 MB each.</p>
  <label for="doc-tag">Tag</label>
  <input type="text" id="doc-tag" name="tag" placeholder="e.g. invoice-2024">
  <button type="submit" class="btn btn-primary">Upload</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="survey-form" action="/survey" method="post">
  <h2>Quick survey</h2>
  <fieldset>
    <legend>How often do you use the app?</legend>
    <label><input type="radio" name="frequency" value="daily"> Daily</label>
    <label><input type="radio" name="frequency" value="weekly"> Weekly</label>
    <label><input type="radio" name="frequency" value="monthly"> Monthly</label>
    <label><input type="radio" name="frequency" value="rarely"> Rarely</label>
  </fieldset>
  <label for="improve">What should we improve?</label>
  <select id="improve" name="improve">
    <option value="speed">Speed</option>
    <option value="design">Design</option>
    <option value="features">Features</option>
    <option value="docs">Documentation</option>
  </select>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="donate-form" action="/donate" method="post">
  <h2>Support the cause</h2>
  <fieldset>
    <legend>Choose an amount</legend>
    <label><input type="radio" name="amount" value="25"> $25</label>
    <label><input type="radio" name="amount" value="50" checked> $50</label>
    <label><input type="radio" name="amount" value="100"> $100</label>
    <label><input type="radio" name="amount" value="custom"> Custom</label>
  </fieldset>
  <label for="donation-note">Leave a note</label>
  <input type="text" id="donation-note" name="note" placeholder="In memory of...">
  <button type="submit" class="btn btn-primary">Donate now</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="settings-form" action="/settings" method="post">
  <h2>Notification settings</h2>
  <label class="switch">
    <input type="checkbox" name="email_digest" checked>
    <span>Weekly email digest</span>
  </label>
  <label class="switch">
    <input type="checkbox" name="push_deploys">
    <span>Push alerts when deploys finish</span>
  </label>
  <label class="switch">
    <input type="checkbox" name="sms_incidents" checked>
    <span>SMS for critical incidents</span>
  </label>
  <label for="quiet-hours">Quiet hours start</label>
  <input type="time" id="quiet-hours" name="quiet_hours" value="22:00">
  <button type="submit" class="btn btn-primary">Save preferences</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="payment-form" action="/pay" method="post">
  <h2>Payment details</h2>
  <label for="card-name">Name on card</label>
  <input type="text" id="card-name" name="card_name" autocomplete="cc-name" required>
  <label for="card-number">Card number</label>
  <input type="text" id="card-number" name="card_number" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" required>
  <div class="card-row">
    <label for="card-expiry">Expiry</label>
    <input type="text" id="card-expiry" name="card_expiry" placeholder="MM/YY" autocomplete="cc-exp" required>
    <label for="card-cvc">CVC</label>
    <input type="text" id="card-cvc" name="card_cvc" inputmode="numeric" autocomplete="cc-csc" maxlength="4" required>
  </div>
  <button type="submit" class="btn btn-primary">Pay $129.00</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="address-form" action="/addresses" method="post">
  <h2>Add a shipping address</h2>
  <label for="recipient">Recipient</label>
  <input type="text" id="recipient" name="recipient" required>
  <label for="street">Street address</label>
  <input type="text" id="street" name="street" required>
  <label for="apt">Apartment, suite (optional)</label>
  <input type="text" id="apt" name="apt">
  <label for="city2">City</label>
  <input type="text" id="city2" name="city" required>
  <label for="region">State / Province</label>
  <input type="text" id="region" name="region" required>
  <label for="postal">Postal code</label>
  <input type="text" id="postal" name="postal" required>
  <button type="submit" class="btn btn-primary">Save address</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="invite-form" action="/invite" method="post">
  <h2>Invite teammates</h2>
  <label for="emails">Email addresses</label>
  <textarea id="emails" name="emails" rows="3" required placeholder="ada@example.com&#10;grace@example.com"></textarea>
  <label for="role">Role</label>
  <select id="role" name="role">
    <option value="member">Member</option>
    <option value="admin">Admin</option>
    <option value="viewer">Viewer</option>
  </select>
  <button type="submit" class="btn btn-primary">Send invites</button>
</form>`, [
  {},
], 'forms');

// ===========================================================================
// Cards
// ===========================================================================
add(({ price, name, rating }) => `<article class="product-card">
  <img src="/img/headphones.jpg" alt="${name}" width="300" height="200">
  <div class="card-body">
    <h3 class="card-title">${name}</h3>
    <p class="card-price">$${price}</p>
    <p class="card-rating" aria-label="Rated ${rating} out of 5">${rating} / 5</p>
    <button type="button" class="btn">Add to cart</button>
  </div>
</article>`, [
  { name: 'Aurora Wireless Headphones', price: '189.00', rating: '4.6' },
  { name: 'Pulse Smartwatch Series 5', price: '249.00', rating: '4.4' },
], 'cards');

add(({ name, role }) => `<article class="profile-card">
  <img src="/img/avatar-tomas.png" alt="Portrait of ${name}" width="96" height="96">
  <h3 class="card-title">${name}</h3>
  <p class="card-sub">${role}</p>
  <p class="card-text">Leads the platform team and cares deeply about developer experience.</p>
  <a class="card-link" href="/team/tomas">View profile</a>
</article>`, [
  { name: 'Tomás Rivera', role: 'Staff Engineer, Platform' },
  { name: 'Amara Okafor', role: 'Head of Design' },
], 'cards');

add(({ plan, price, feature }) => `<article class="pricing-card ${plan === 'Pro' ? 'featured' : ''}">
  <h3 class="card-title">${plan}</h3>
  <p class="card-price">$${price}<span class="per">/mo</span></p>
  <ul class="feature-list">
    <li>${feature}</li>
    <li>Unlimited viewers</li>
    <li>Priority support</li>
  </ul>
  <a class="btn btn-primary" href="/pricing/${plan.toLowerCase()}">Choose ${plan}</a>
</article>`, [
  { plan: 'Starter', price: '0', feature: 'Up to 3 projects' },
  { plan: 'Pro', price: '24', feature: 'Unlimited projects' },
  { plan: 'Enterprise', price: 'Contact us', feature: 'SSO and audit logs' },
], 'cards');

add(({ quote, author, company }) => `<figure class="testimonial-card">
  <blockquote>
    <p>${quote}</p>
  </blockquote>
  <figcaption>
    <strong>${author}</strong>
    <span>${company}</span>
  </figcaption>
</figure>`, [
  { quote: 'We cut our release cycle from weeks to hours after switching. The onboarding was painless.', author: 'Marcus Webb', company: 'CTO, Relay Systems' },
  { quote: 'The best investment our data team made this year. Everyone from analysts to execs uses it daily.', author: 'Ines Costa', company: 'Head of Data, Vela Retail' },
], 'cards');

add(({ title, tag, mins }) => `<article class="post-card">
  <img src="/img/post-cover.jpg" alt="" width="360" height="200">
  <div class="card-body">
    <p class="card-tag">${tag}</p>
    <h3 class="card-title"><a href="/blog/${title.toLowerCase().replace(/\s+/g, '-')}">${title}</a></h3>
    <p class="card-meta">${mins} min read</p>
  </div>
</article>`, [
  { title: 'Scaling Postgres to a Billion Rows', tag: 'Engineering', mins: '12' },
  { title: 'Designing for Slow Connections', tag: 'Design', mins: '8' },
  { title: 'How We Cut Our AWS Bill in Half', tag: 'Infrastructure', mins: '15' },
], 'cards');

add(({ label, value, trend, good }) => `<article class="stat-card">
  <p class="stat-label">${label}</p>
  <p class="stat-value">${value}</p>
  <p class="stat-trend ${good ? 'up' : 'down'}">${trend}</p>
</article>`, [
  { label: 'Monthly active users', value: '48,210', trend: '+12% vs last month', good: true },
  { label: 'Error rate', value: '0.42%', trend: '-0.18 pts', good: true },
  { label: 'Median response time', value: '212 ms', trend: '+38 ms', good: false },
  { label: 'Churn rate', value: '1.9%', trend: '-0.3 pts', good: true },
], 'cards');

add(() => `<article class="notification-card">
  <p class="notif-time">2m ago</p>
  <h4 class="card-title">Deploy succeeded</h4>
  <p class="card-text">api@v1.4.0 was deployed to production in 3m 12s.</p>
  <a class="card-link" href="/deploys/84122">View details</a>
</article>`, [
  {},
], 'cards');

add(({ title, date, location }) => `<article class="event-card">
  <time class="event-date" datetime="${date}">${date}</time>
  <h3 class="card-title">${title}</h3>
  <p class="card-sub">${location}</p>
  <a class="btn" href="/events/register">Register</a>
</article>`, [
  { title: 'Frontend Conference 2025', date: '2025-03-18', location: 'Amsterdam, NL' },
  { title: 'Kubernetes Meetup: Spring Edition', date: '2025-04-09', location: 'Berlin, DE' },
], 'cards');

add(({ dish, time, kcal }) => `<article class="recipe-card">
  <img src="/img/recipe-pasta.jpg" alt="Plate of ${dish}" width="360" height="220">
  <div class="card-body">
    <h3 class="card-title">${dish}</h3>
    <p class="card-meta">${time} · ${kcal} kcal · Serves 4</p>
    <a class="card-link" href="/recipes/${dish.toLowerCase().replace(/\s+/g, '-')}">View recipe</a>
  </div>
</article>`, [
  { dish: 'Creamy Mushroom Pasta', time: '25 min', kcal: '480' },
  { dish: 'Miso Salmon with Greens', time: '30 min', kcal: '520' },
], 'cards');

add(({ title, year, genre }) => `<article class="movie-card">
  <img src="/img/movie-cover.jpg" alt="Poster for ${title}" width="240" height="360">
  <div class="card-body">
    <h3 class="card-title">${title}</h3>
    <p class="card-sub">${year} · ${genre}</p>
    <p class="card-rating" aria-label="Rated 4.5 out of 5">4.5 / 5</p>
    <a class="btn" href="/watch/${year}-${title.toLowerCase().replace(/\s+/g, '-')}">Watch now</a>
  </div>
</article>`, [
  { title: 'The Last Lighthouse', year: '2024', genre: 'Drama' },
  { title: 'Signal Lost', year: '2023', genre: 'Sci-Fi Thriller' },
], 'cards');

add(({ repo, lang, stars }) => `<article class="repo-card">
  <h3 class="card-title"><a href="https://github.com/acme/${repo}">acme/${repo}</a></h3>
  <p class="card-text">A tiny ${lang} library for building type-safe request handlers.</p>
  <p class="card-meta">${lang} · ${stars} stars · MIT license</p>
</article>`, [
  { repo: 'typerouter', lang: 'TypeScript', stars: '1,204' },
  { repo: 'streamline', lang: 'Go', stars: '842' },
], 'cards');

add(({ city, temp, cond }) => `<article class="weather-card">
  <h3 class="card-title">${city}</h3>
  <p class="card-price">${temp}°C</p>
  <p class="card-sub">${cond}</p>
  <p class="card-meta">H: 21° L: 9° · Wind 14 km/h</p>
</article>`, [
  { city: 'Lisbon', temp: '17', cond: 'Partly cloudy' },
  { city: 'Oslo', temp: '3', cond: 'Light snow' },
], 'cards');

add(({ artist, album, year }) => `<article class="album-card">
  <img src="/img/album-art.jpg" alt="Cover of ${album}" width="220" height="220">
  <div class="card-body">
    <h3 class="card-title">${album}</h3>
    <p class="card-sub">${artist}</p>
    <p class="card-meta">${year} · 11 tracks · 44 min</p>
  </div>
</article>`, [
  { album: 'Midnight Tram', artist: 'The Copper Keys', year: '2024' },
  { album: 'Slow Rivers', artist: 'June & the Orchard', year: '2022' },
], 'cards');

add(({ rank, title, points }) => `<article class="achievement-card">
  <p class="ach-badge">${rank}</p>
  <div>
    <h4 class="card-title">${title}</h4>
    <p class="card-meta">${points} points</p>
  </div>
</article>`, [
  { rank: 'Gold', title: 'Ship 100 deploys', points: '500' },
  { rank: 'Silver', title: 'First on-call rotation', points: '250' },
], 'cards');

add(({ route, time, price, stops }) => `<article class="flight-card">
  <p class="card-sub">${route}</p>
  <p class="card-price">$${price}</p>
  <p class="card-meta">${time} · ${stops}</p>
  <a class="btn" href="/book/${route.toLowerCase().replace(/\s+/g, '-')}">Select</a>
</article>`, [
  { route: 'SFO → LIS', time: '11h 20m', price: '486', stops: '1 stop' },
  { route: 'LHR → JFK', time: '8h 05m', price: '312', stops: 'Nonstop' },
], 'cards');

add(({ hotel, rating, price }) => `<article class="hotel-card">
  <img src="/img/hotel-room.jpg" alt="Room at ${hotel}" width="360" height="220">
  <div class="card-body">
    <h3 class="card-title">${hotel}</h3>
    <p class="card-rating" aria-label="Rated ${rating} out of 5">${rating} / 5</p>
    <p class="card-price">$${price} <span class="per">/ night</span></p>
    <a class="btn" href="/hotels/reserve">Reserve</a>
  </div>
</article>`, [
  { hotel: 'The Grand Meridian', rating: '4.7', price: '189' },
  { hotel: 'Harborview Inn', rating: '4.2', price: '96' },
], 'cards');

// ===========================================================================
// Tables
// ===========================================================================
add(() => `<table class="pricing-table">
  <thead>
    <tr>
      <th>Plan</th>
      <th>Starter</th>
      <th>Pro</th>
      <th>Enterprise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Projects</th>
      <td>3</td>
      <td>Unlimited</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <th scope="row">Seats</th>
      <td>5</td>
      <td>25</td>
      <td>Unlimited</td>
    </tr>
    <tr>
      <th scope="row">Support</th>
      <td>Community</td>
      <td>Priority</td>
      <td>Dedicated</td>
    </tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="leaderboard">
  <caption>Top contributors this month</caption>
  <thead>
    <tr>
      <th scope="col">Rank</th>
      <th scope="col">Player</th>
      <th scope="col">WPM</th>
      <th scope="col">Accuracy</th>
      <th scope="col">Races</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>nova_typer</td><td>132</td><td>98.2%</td><td>48</td></tr>
    <tr><td>2</td><td>qwertyqueen</td><td>128</td><td>97.9%</td><td>61</td></tr>
    <tr><td>3</td><td>swiftfingers</td><td>124</td><td>98.8%</td><td>35</td></tr>
    <tr><td>4</td><td>byte_blitz</td><td>119</td><td>96.4%</td><td>52</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(({ team }) => `<table class="schedule">
  <caption>${team} — match schedule</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Opponent</th>
      <th scope="col">Venue</th>
      <th scope="col">Kickoff</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Sat, Mar 15</td><td>Riverside FC</td><td>Home</td><td>15:00</td></tr>
    <tr><td>Sat, Mar 22</td><td>Eastbank United</td><td>Away</td><td>17:30</td></tr>
    <tr><td>Sun, Mar 30</td><td>Northgate City</td><td>Home</td><td>14:00</td></tr>
  </tbody>
</table>`, [
  { team: 'Harbor Athletic' },
  { team: 'Crescent City FC' },
], 'tables');

add(() => `<table class="roster">
  <caption>First-team squad</caption>
  <thead>
    <tr>
      <th scope="col">No.</th>
      <th scope="col">Player</th>
      <th scope="col">Position</th>
      <th scope="col">Age</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Mateus Rocha</td><td>Goalkeeper</td><td>29</td></tr>
    <tr><td>4</td><td>Elena Petrova</td><td>Defender</td><td>24</td></tr>
    <tr><td>8</td><td>Sam Osei</td><td>Midfielder</td><td>26</td></tr>
    <tr><td>10</td><td>Lucas Meyer</td><td>Forward</td><td>22</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="inventory">
  <caption>Warehouse stock — Rotterdam</caption>
  <thead>
    <tr>
      <th scope="col">SKU</th>
      <th scope="col">Product</th>
      <th scope="col">On hand</th>
      <th scope="col">Reserved</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>SKU-2041</td><td>Steel frame, 26"</td><td>142</td><td>8</td><td>In stock</td></tr>
    <tr><td>SKU-2042</td><td>Carbon fork</td><td>6</td><td>4</td><td>Low</td></tr>
    <tr><td>SKU-2043</td><td>Disc brake set</td><td>0</td><td>0</td><td>Out of stock</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="log-table">
  <caption>Recent audit events</caption>
  <thead>
    <tr>
      <th scope="col">Time</th>
      <th scope="col">Actor</th>
      <th scope="col">Action</th>
      <th scope="col">Result</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>09:41:22</td><td>alice@acme.io</td><td>deploy.production</td><td>success</td></tr>
    <tr><td>09:12:07</td><td>jenkins</td><td>build.started</td><td>success</td></tr>
    <tr><td>08:58:03</td><td>bob@acme.io</td><td>settings.rotate_key</td><td>success</td></tr>
    <tr><td>08:30:44</td><td>unknown</td><td>auth.login_failed</td><td>denied</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="grades-table">
  <caption>Course grades — CS 201</caption>
  <thead>
    <tr>
      <th scope="col">Student</th>
      <th scope="col">Midterm</th>
      <th scope="col">Final</th>
      <th scope="col">Grade</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Anaya Patel</td><td>88</td><td>92</td><td>A</td></tr>
    <tr><td>Jonas Keller</td><td>76</td><td>81</td><td>B</td></tr>
    <tr><td>Mia Tanaka</td><td>94</td><td>97</td><td>A</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(({ season }) => `<table class="fixtures">
  <caption>${season} season fixtures</caption>
  <thead>
    <tr>
      <th scope="col">Round</th>
      <th scope="col">Home</th>
      <th scope="col">Score</th>
      <th scope="col">Away</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>Thunder Bay</td><td>3 – 1</td><td>Lake City</td></tr>
    <tr><td>2</td><td>Summit Ridge</td><td>2 – 2</td><td>Thunder Bay</td></tr>
    <tr><td>3</td><td>Thunder Bay</td><td>0 – 2</td><td>Pine Valley</td></tr>
  </tbody>
</table>`, [
  { season: '2024–25' },
  { season: '2025' },
], 'tables');

add(() => `<table class="releases">
  <caption>Recent releases</caption>
  <thead>
    <tr>
      <th scope="col">Version</th>
      <th scope="col">Date</th>
      <th scope="col">Highlights</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>v2.4.0</td><td>2025-02-11</td><td>Realtime sync, new dashboard</td></tr>
    <tr><td>v2.3.1</td><td>2025-01-27</td><td>Bug fixes for export</td></tr>
    <tr><td>v2.3.0</td><td>2025-01-14</td><td>CSV import, audit log</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="members">
  <caption>Workspace members</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Role</th>
      <th scope="col">Last active</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Grace Hopper</td><td>grace@acme.io</td><td>Admin</td><td>Today</td></tr>
    <tr><td>Alan Turing</td><td>alan@acme.io</td><td>Member</td><td>2 days ago</td></tr>
    <tr><td>Ada Lovelace</td><td>ada@acme.io</td><td>Viewer</td><td>Last week</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="transactions">
  <caption>Recent transactions</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Description</th>
      <th scope="col">Category</th>
      <th scope="col">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Mar 12</td><td>Cloud hosting — Feb</td><td>Infrastructure</td><td>−$842.10</td></tr>
    <tr><td>Mar 11</td><td>Invoice #4821 paid</td><td>Revenue</td><td>+$4,200.00</td></tr>
    <tr><td>Mar 08</td><td>Design software license</td><td>Software</td><td>−$59.00</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

// ===========================================================================
// Sections, heroes, footers
// ===========================================================================
add(() => `<section class="hero">
  <h1>Ship software your customers love</h1>
  <p class="lead">Deploy, monitor and iterate with a platform built for modern teams.</p>
  <div class="hero-cta">
    <a class="btn btn-primary" href="/signup">Start free trial</a>
    <a class="btn" href="/demo">Book a demo</a>
  </div>
  <p class="hint">No credit card required · 14-day trial</p>
</section>`, [
  {},
], 'sections');

add(({ title, blurb }) => `<section class="hero">
  <h1>${title}</h1>
  <p class="lead">${blurb}</p>
  <a class="btn btn-primary" href="/get-started">Get started</a>
</section>`, [
  { title: 'Analytics for the open web', blurb: 'Privacy-friendly, real-time insights without the tracking baggage.' },
  { title: 'A calendar that plans your day', blurb: 'Smart scheduling that works around your deep-work blocks.' },
], 'sections');

add(() => `<section class="features" aria-labelledby="features-heading">
  <h2 id="features-heading">Everything you need to launch</h2>
  <div class="feature-grid">
    <article class="feature">
      <h3>Instant deploys</h3>
      <p>Push to main and your changes go live in under a minute.</p>
    </article>
    <article class="feature">
      <h3>Global edge network</h3>
      <p>Serve assets from 300+ cities around the world.</p>
    </article>
    <article class="feature">
      <h3>Built-in monitoring</h3>
      <p>Errors, latency and traffic in one dashboard.</p>
    </article>
    <article class="feature">
      <h3>Preview environments</h3>
      <p>Test every pull request in an isolated URL.</p>
    </article>
  </div>
</section>`, [
  {},
], 'sections');

add(() => `<section class="about">
  <h2>Our story</h2>
  <p>Founded in 2019 in a shared office above a bakery, we set out to make
  infrastructure boring — in the best way. Today a team of 40 works across
  four time zones to keep the platform running for thousands of teams.</p>
  <p>We believe tools should fade into the background and let people focus
  on the work that matters.</p>
</section>`, [
  {},
], 'sections');

add(() => `<section class="faq" aria-labelledby="faq-heading">
  <h2 id="faq-heading">Frequently asked questions</h2>
  <details>
    <summary>Is there a free tier?</summary>
    <p>Yes — the Starter plan is free forever for up to 3 projects.</p>
  </details>
  <details>
    <summary>Can I migrate from another provider?</summary>
    <p>We provide importers for the most common platforms and docs for custom migrations.</p>
  </details>
  <details>
    <summary>Do you offer SSO?</summary>
    <p>SSO is included on the Enterprise plan with SAML and OIDC support.</p>
  </details>
</section>`, [
  {},
], 'sections');

add(() => `<section class="contact" aria-labelledby="contact-heading">
  <h2 id="contact-heading">Talk to us</h2>
  <address>
    Acme Software Inc.<br>
    100 Harbor Street, Suite 4<br>
    Portland, OR 97201
  </address>
  <p>Email: <a href="mailto:hello@acme.io">hello@acme.io</a></p>
  <p>Phone: <a href="tel:+15035550142">+1 (503) 555-0142</a></p>
</section>`, [
  {},
], 'sections');

add(() => `<section class="gallery" aria-label="Project gallery">
  <h2>Recent work</h2>
  <div class="gallery-grid">
    <figure>
      <img src="/img/work-01.jpg" alt="Riverside housing cooperative website">
      <figcaption>Riverside Cooperative</figcaption>
    </figure>
    <figure>
      <img src="/img/work-02.jpg" alt="Kinfolk cafe brand site">
      <figcaption>Kinfolk Cafe</figcaption>
    </figure>
    <figure>
      <img src="/img/work-03.jpg" alt="Trailhead festival campaign">
      <figcaption>Trailhead Festival</figcaption>
    </figure>
  </div>
</section>`, [
  {},
], 'sections');

add(() => `<section class="stats" aria-label="Key numbers">
  <div class="stat">
    <p class="stat-value">12k+</p>
    <p class="stat-label">Teams on the platform</p>
  </div>
  <div class="stat">
    <p class="stat-value">99.99%</p>
    <p class="stat-label">Uptime SLA</p>
  </div>
  <div class="stat">
    <p class="stat-value">180ms</p>
    <p class="stat-label">Median edge latency</p>
  </div>
  <div class="stat">
    <p class="stat-value">4.9/5</p>
    <p class="stat-label">Average support rating</p>
  </div>
</section>`, [
  {},
], 'sections');

add(() => `<section class="team" aria-labelledby="team-heading">
  <h2 id="team-heading">Meet the team</h2>
  <ul class="team-grid">
    <li>
      <img src="/img/team-elena.jpg" alt="Portrait of Elena Petrova" width="80" height="80">
      <h3>Elena Petrova</h3>
      <p>Founder & CEO</p>
    </li>
    <li>
      <img src="/img/team-marcus.jpg" alt="Portrait of Marcus Webb" width="80" height="80">
      <h3>Marcus Webb</h3>
      <p>CTO</p>
    </li>
    <li>
      <img src="/img/team-ines.jpg" alt="Portrait of Ines Costa" width="80" height="80">
      <h3>Ines Costa</h3>
      <p>Head of Design</p>
    </li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<article class="blog-post">
  <header>
    <h1>Lessons from Running Postgres at Scale</h1>
    <p class="post-meta">
      By <a href="/authors/dana">Dana Kwan</a> · Published
      <time datetime="2025-02-20">February 20, 2025</time>
    </p>
  </header>
  <p>Two years ago our analytics cluster hit a wall. Queries that took
  seconds now took minutes, and the pager rang more often than anyone
  liked. Here is what we changed, in the order that mattered most.</p>
  <h2>Start with the slow queries</h2>
  <p>Before touching infrastructure, we enabled <code>pg_stat_statements</code>
  and ranked queries by total execution time. The top ten accounted for
  nearly 60% of all database CPU.</p>
  <h2>Partition early, not late</h2>
  <p>Event tables grow without mercy. Range partitioning by month kept our
  largest tables manageable and made retention deletes nearly free.</p>
</article>`, [
  {},
], 'sections');

add(() => `<section class="cta-banner">
  <h2>Ready to get started?</h2>
  <p>Join 12,000 teams already shipping faster with Acme.</p>
  <a class="btn btn-primary" href="/signup">Create free account</a>
</section>`, [
  {},
], 'sections');

add(() => `<section class="logos" aria-label="Trusted by">
  <h2 class="visually-hidden">Companies using our platform</h2>
  <ul class="logo-list">
    <li>Northwind</li>
    <li>Relay Systems</li>
    <li>Vela Retail</li>
    <li>Bluebird Coffee</li>
    <li>Crestline Bank</li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<section class="process" aria-labelledby="process-heading">
  <h2 id="process-heading">How it works</h2>
  <ol class="process-steps">
    <li>
      <h3>Connect your repo</h3>
      <p>Link GitHub, GitLab or Bitbucket in two clicks.</p>
    </li>
    <li>
      <h3>Deploy on every push</h3>
      <p>We build, test and ship with zero config.</p>
    </li>
    <li>
      <h3>Monitor and iterate</h3>
      <p>Watch metrics, roll back instantly, ship again.</p>
    </li>
  </ol>
</section>`, [
  {},
], 'sections');

add(() => `<section class="newsletter">
  <h2>Stay in the loop</h2>
  <p>Product updates, engineering deep dives and occasional cat photos.</p>
  <form action="/subscribe" method="post">
    <label class="visually-hidden" for="nl-email">Email</label>
    <input type="email" id="nl-email" name="email" required placeholder="you@example.com">
    <button type="submit" class="btn btn-primary">Subscribe</button>
  </form>
</section>`, [
  {},
], 'sections');

add(() => `<footer class="site-footer">
  <div class="footer-col">
    <p class="brand">Acme</p>
    <p>Built for teams who ship.</p>
  </div>
  <nav class="footer-nav" aria-label="Footer">
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/careers">Careers</a></li>
      <li><a href="/press">Press</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
  <p class="footer-legal">© 2025 Acme Software Inc. All rights reserved.</p>
</footer>`, [
  {},
], 'sections');

add(({ name }) => `<footer class="site-footer">
  <div class="footer-brand">
    <p class="brand">${name}</p>
  </div>
  <div class="footer-columns">
    <nav aria-label="Product">
      <h2>Product</h2>
      <ul>
        <li><a href="/features">Features</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/changelog">Changelog</a></li>
      </ul>
    </nav>
    <nav aria-label="Company">
      <h2>Company</h2>
      <ul>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/jobs">Jobs</a></li>
        <li><a href="/privacy">Privacy</a></li>
        <li><a href="/terms">Terms</a></li>
      </ul>
    </nav>
  </div>
  <p class="footer-legal">© 2025 ${name}. All rights reserved.</p>
</footer>`, [
  { name: 'Maple Street Books' },
  { name: 'Kinfolk Studio' },
], 'sections');

// ===========================================================================
// Lists, sidebars, components
// ===========================================================================
add(() => `<section class="todo-list" aria-label="Today's tasks">
  <h2>Today</h2>
  <ul>
    <li><label><input type="checkbox" checked> Review PR #482</label></li>
    <li><label><input type="checkbox"> Write Q3 roadmap draft</label></li>
    <li><label><input type="checkbox"> 1:1 with onboarding mentee</label></li>
    <li><label><input type="checkbox"> Update incident runbook</label></li>
  </ul>
</section>`, [
  {},
], 'lists');

add(() => `<section class="playlist" aria-label="Playlist: Focus Flow">
  <h2>Focus Flow</h2>
  <ol class="track-list">
    <li>Morning Static — Amber Waves <span class="track-time">3:42</span></li>
    <li>Slow Burn — The Copper Keys <span class="track-time">4:10</span></li>
    <li>Glass Harbor — June & the Orchard <span class="track-time">3:55</span></li>
    <li>Paper Planes — Nadia Voss <span class="track-time">2:58</span></li>
  </ol>
</section>`, [
  {},
], 'lists');

add(() => `<section class="order-summary" aria-label="Order summary">
  <h2>Order summary</h2>
  <ul class="order-lines">
    <li><span>2 × Aurora Headphones</span><span>$378.00</span></li>
    <li><span>1 × Travel case</span><span>$24.00</span></li>
    <li><span>Shipping</span><span>Free</span></li>
  </ul>
  <p class="order-total">Total: <strong>$402.00</strong></p>
  <a class="btn btn-primary" href="/checkout">Checkout</a>
</section>`, [
  {},
], 'lists');

add(() => `<aside class="sidebar" aria-label="Related links">
  <h2>Related articles</h2>
  <ul>
    <li><a href="/blog/query-planning">Reading PostgreSQL query plans</a></li>
    <li><a href="/blog/vacuum-tips">Autovacuum settings that work</a></li>
    <li><a href="/blog/index-strategies">Index strategies for high write loads</a></li>
  </ul>
</aside>`, [
  {},
], 'lists');

add(() => `<section class="thread" aria-label="Comments">
  <h2 class="visually-hidden">Discussion</h2>
  <article class="comment">
    <footer>
      <img src="/img/avatar-nadia.jpg" alt="" width="40" height="40">
      <span>Nadia Voss</span>
      <time datetime="2025-02-21T09:12:00">Feb 21, 09:12</time>
    </footer>
    <p>Great write-up — the partitioning section saved us a weekend.</p>
  </article>
  <article class="comment">
    <footer>
      <img src="/img/avatar-tomas.jpg" alt="" width="40" height="40">
      <span>Tomás Rivera</span>
      <time datetime="2025-02-21T10:04:00">Feb 21, 10:04</time>
    </footer>
    <p>One note: pg_partman handles the maintenance automatically if you need it.</p>
  </article>
  <form class="comment-form" action="/posts/42/comments" method="post">
    <label class="visually-hidden" for="comment-text">Add a comment</label>
    <textarea id="comment-text" name="body" rows="3" placeholder="Join the discussion"></textarea>
    <button type="submit" class="btn">Post comment</button>
  </form>
</section>`, [
  {},
], 'lists');

add(() => `<div class="notifications" role="region" aria-label="Notifications">
  <h2 class="visually-hidden">Notifications</h2>
  <ul>
    <li><a href="/deploys/90012">Deploy of web@v2.4.0 succeeded</a></li>
    <li><a href="/alerts/77">CPU alert cleared for api-prod-2</a></li>
    <li><a href="/prs/512">PR #512 is ready for review</a></li>
  </ul>
</div>`, [
  {},
], 'lists');

add(() => `<div class="tag-cloud" aria-label="Topics">
  <h2>Browse by topic</h2>
  <p>
    <a class="tag" href="/t/kubernetes">Kubernetes</a>
    <a class="tag" href="/t/postgres">PostgreSQL</a>
    <a class="tag" href="/t/rust">Rust</a>
    <a class="tag" href="/t/typescript">TypeScript</a>
    <a class="tag" href="/t/observability">Observability</a>
    <a class="tag" href="/t/ci">CI/CD</a>
  </p>
</div>`, [
  {},
], 'lists');

add(() => `<nav class="side-menu" aria-label="Account">
  <h2>Account</h2>
  <ul>
    <li><a href="/account/profile" aria-current="page">Profile</a></li>
    <li><a href="/account/security">Security</a></li>
    <li><a href="/account/billing">Billing</a></li>
    <li><a href="/account/teams">Teams</a></li>
    <li><a href="/account/api-keys">API keys</a></li>
  </ul>
</nav>`, [
  {},
], 'lists');

add(() => `<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/docs">Documentation</a></li>
    <li><a href="/docs/api">API</a></li>
    <li aria-current="page">Authentication</li>
  </ol>
</nav>`, [
  {},
], 'components');

add(() => `<nav class="pagination" aria-label="Pagination">
  <a class="page-link" href="/blog?page=2" rel="prev">Previous</a>
  <a href="/blog?page=1">1</a>
  <a href="/blog?page=2">2</a>
  <a href="/blog?page=3" aria-current="page">3</a>
  <a href="/blog?page=4">4</a>
  <a class="page-link" href="/blog?page=4" rel="next">Next</a>
</nav>`, [
  {},
], 'components');

add(() => `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Delete project?</h2>
  <p>This will permanently remove <strong>checkout-api</strong> and its
  deployments. This action cannot be undone.</p>
  <div class="modal-actions">
    <button type="button" class="btn">Cancel</button>
    <button type="button" class="btn btn-danger">Delete project</button>
  </div>
</div>`, [
  {},
], 'components');

add(() => `<div class="alert alert-error" role="alert">
  <strong>Build failed.</strong> The test suite reported 3 failures. See the
  <a href="/builds/8812">build log</a> for details.
</div>`, [
  {},
], 'components');

add(() => `<div class="alert alert-warning" role="alert">
  Your trial ends in <strong>3 days</strong>. Add a payment method to keep
  your workspace active.
</div>`, [
  {},
], 'components');

add(() => `<ol class="steps" aria-label="Onboarding progress">
  <li class="step done">Create account</li>
  <li class="step done">Connect repository</li>
  <li class="step active" aria-current="step">Deploy first app</li>
  <li class="step">Invite teammates</li>
</ol>`, [
  {},
], 'components');

add(() => `<div class="toast" role="status" aria-live="polite">
  <p>Changes saved successfully.</p>
  <button type="button" aria-label="Dismiss">×</button>
</div>`, [
  {},
], 'components');

add(() => `<form class="search-bar" action="/search" method="get" role="search">
  <label class="visually-hidden" for="site-search">Search</label>
  <input type="search" id="site-search" name="q" placeholder="Search docs, guides, API...">
  <kbd>/</kbd>
</form>`, [
  {},
], 'components');

add(() => `<div class="avatar-group" aria-label="3 people online">
  <img src="/img/avatar-1.jpg" alt="Dana Kwan" width="36" height="36">
  <img src="/img/avatar-2.jpg" alt="Mateus Rocha" width="36" height="36">
  <img src="/img/avatar-3.jpg" alt="Anaya Patel" width="36" height="36">
  <span class="avatar-more">+12</span>
</div>`, [
  {},
], 'components');

add(() => `<p class="rating" aria-label="Rated 4.5 out of 5">
  <span aria-hidden="true">★★★★★</span>
  <span class="rating-num">4.5</span>
  <span class="rating-count">(218 reviews)</span>
</p>`, [
  {},
], 'components');

add(() => `<div class="tabs" role="tablist" aria-label="Account sections">
  <button role="tab" aria-selected="true">Overview</button>
  <button role="tab" aria-selected="false">Usage</button>
  <button role="tab" aria-selected="false">Invoices</button>
  <button role="tab" aria-selected="false">Settings</button>
</div>`, [
  {},
], 'components');

add(() => `<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header">…</header>
<main id="main">
  <h1>Page title</h1>
  <p>Main content starts here.</p>
</main>`, [
  {},
], 'components');

add(() => `<figure>
  <img src="/img/diagram.png" alt="Architecture diagram: edge, origin, database">
  <figcaption>Figure 1 — Request flow through the edge network.</figcaption>
</figure>`, [
  {},
], 'components');

add(() => `<blockquote>
  <p>The best documentation is the kind you only need to read once.</p>
  <footer>— <cite>Release notes, v2.0</cite></footer>
</blockquote>`, [
  {},
], 'components');

add(() => `<audio controls preload="metadata" aria-label="Episode 42 audio">
  <source src="/media/ep42.mp3" type="audio/mpeg">
  <p>Your browser does not support the audio element.
  <a href="/media/ep42.mp3">Download the episode</a>.</p>
</audio>`, [
  {},
], 'components');

add(() => `<video controls poster="/img/video-poster.jpg" width="640">
  <source src="/media/intro.webm" type="video/webm">
  <source src="/media/intro.mp4" type="video/mp4">
  <p>Your browser does not support embedded video.
  <a href="/media/intro.mp4">Download the mp4</a>.</p>
</video>`, [
  {},
], 'components');

add(() => `<p>Storage used:
  <meter min="0" max="100" low="70" high="90" optimum="30" value="82"
    aria-label="82 gigabytes of 100 gigabytes used">82%</meter>
</p>`, [
  {},
], 'components');

add(() => `<dl class="meta-list">
  <dt>Repository</dt>
  <dd><a href="https://github.com/acme/typerouter">acme/typerouter</a></dd>
  <dt>License</dt>
  <dd>MIT</dd>
  <dt>Latest release</dt>
  <dd><time datetime="2025-01-30">v2.4.0</time></dd>
</dl>`, [
  {},
], 'components');

add(() => `<div class="card" aria-label="Invitation">
  <h2>You're invited</h2>
  <p>Elena invited you to join the <strong>platform</strong> workspace.</p>
  <div class="card-actions">
    <a class="btn btn-primary" href="/invites/accept">Accept</a>
    <a class="btn" href="/invites/decline">Decline</a>
  </div>
</div>`, [
  {},
], 'components');

add(() => `<div class="badge-row">
  <span class="badge badge-green">Healthy</span>
  <span class="badge badge-amber">Degraded</span>
  <span class="badge badge-red">Down</span>
</div>`, [
  {},
], 'components');

add(() => `<dialog open aria-labelledby="dialog-title">
  <h2 id="dialog-title">Update available</h2>
  <p>A new version of the app is ready to install.</p>
  <form method="dialog">
    <button type="submit" class="btn btn-primary">Reload now</button>
    <button type="submit" class="btn">Later</button>
  </form>
</dialog>`, [
  {},
], 'components');

add(() => `<section class="pricing-note">
  <h2>Compare plans</h2>
  <p>All plans include unlimited bandwidth, automatic HTTPS and global
  edge caching. Prices are per workspace, billed monthly.</p>
  <ul>
    <li>Free SSL certificates on every custom domain</li>
    <li>Instant rollbacks with zero downtime</li>
    <li>24/7 monitoring across 30+ regions</li>
  </ul>
</section>`, [
  {},
], 'components');

add(() => `<div class="empty-state">
  <img src="/img/empty-box.png" alt="" width="96" height="96">
  <h2>No deployments yet</h2>
  <p>Push a commit to your repository and the first build will appear here.</p>
  <a class="btn btn-primary" href="/docs/first-deploy">Deploy your first app</a>
</div>`, [
  {},
], 'components');

add(() => `<section class="status">
  <h2 class="visually-hidden">Service status</h2>
  <ul class="status-list">
    <li><span class="status-dot ok" aria-hidden="true"></span> API — Operational</li>
    <li><span class="status-dot ok" aria-hidden="true"></span> Edge network — Operational</li>
    <li><span class="status-dot warn" aria-hidden="true"></span> Log streaming — Degraded</li>
  </ul>
  <p><a href="/status/history">View status history</a></p>
</section>`, [
  {},
], 'components');

// ===========================================================================
// Batch 2: more nav, forms, cards, tables, sections, components
// ===========================================================================
add(({ brand }) => `<nav class="site-nav" aria-label="Primary">
  <a class="brand" href="/">${brand}</a>
  <ul class="nav-links">
    <li><a href="/menu">Menu</a></li>
    <li><a href="/gift-cards">Gift cards</a></li>
    <li><a href="/catering">Catering</a></li>
    <li><a href="/locations">Locations</a></li>
  </ul>
  <a class="btn" href="/order">Order online</a>
</nav>`, [
  { brand: 'Cedar & Pine Kitchen' },
  { brand: 'Golden Grain Bakery' },
], 'nav');

add(() => `<nav class="site-nav" aria-label="Primary">
  <a class="brand" href="/">Trailhead Outdoor</a>
  <ul class="nav-links">
    <li><a href="/gear">Gear</a></li>
    <li><a href="/apparel">Apparel</a></li>
    <li><a href="/guides">Trail guides</a></li>
    <li><a href="/tours">Guided tours</a></li>
  </ul>
  <a class="btn btn-primary" href="/membership">Become a member</a>
</nav>`, [
  {},
], 'nav');

add(() => `<nav class="sub-nav" aria-label="Product">
  <ul class="tab-list">
    <li><a href="/p/aurora-headphones" aria-current="page">Overview</a></li>
    <li><a href="/p/aurora-headphones/specs">Specs</a></li>
    <li><a href="/p/aurora-headphones/reviews">Reviews (218)</a></li>
    <li><a href="/p/aurora-headphones/support">Support</a></li>
  </ul>
</nav>`, [
  {},
], 'nav');

add(({ city }) => `<nav class="city-nav" aria-label="Neighborhood">
  <a class="brand" href="/${city.toLowerCase()}">Visit ${city}</a>
  <ul class="nav-links">
    <li><a href="/${city.toLowerCase()}/things-to-do">Things to do</a></li>
    <li><a href="/${city.toLowerCase()}/eat">Where to eat</a></li>
    <li><a href="/${city.toLowerCase()}/stay">Where to stay</a></li>
    <li><a href="/${city.toLowerCase()}/events">Events</a></li>
  </ul>
</nav>`, [
  { city: 'Prague' },
  { city: 'Kyoto' },
], 'nav');

add(() => `<form class="login-alt" action="/login" method="post">
  <h1>Welcome back</h1>
  <p class="hint">Sign in to continue to your workspace.</p>
  <label for="user">Username or email</label>
  <input type="text" id="user" name="user" required autocomplete="username">
  <label for="pass">Password</label>
  <input type="password" id="pass" name="pass" required autocomplete="current-password">
  <div class="form-row">
    <label><input type="checkbox" name="remember"> Remember me</label>
    <a href="/forgot">Forgot password?</a>
  </div>
  <button type="submit" class="btn btn-primary">Sign in</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="ticket-form" action="/support" method="post">
  <h2>Open a support ticket</h2>
  <label for="t-subject">Subject</label>
  <input type="text" id="t-subject" name="subject" required placeholder="Brief summary">
  <label for="t-project">Project</label>
  <select id="t-project" name="project">
    <option value="checkout-api">checkout-api</option>
    <option value="web">web</option>
    <option value="infra">infrastructure</option>
  </select>
  <label for="t-severity">Severity</label>
  <select id="t-severity" name="severity">
    <option value="low">Low</option>
    <option value="medium" selected>Medium</option>
    <option value="high">High — production down</option>
  </select>
  <label for="t-body">Description</label>
  <textarea id="t-body" name="body" rows="6" required></textarea>
  <button type="submit" class="btn btn-primary">Submit ticket</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="tax-form" action="/taxes" method="post">
  <h2>Tax information</h2>
  <label for="legal-name">Legal name</label>
  <input type="text" id="legal-name" name="legal_name" required>
  <label for="tax-id">Tax ID / EIN</label>
  <input type="text" id="tax-id" name="tax_id" required>
  <label for="tax-address">Registered address</label>
  <input type="text" id="tax-address" name="tax_address" required>
  <fieldset>
    <legend>Entity type</legend>
    <label><input type="radio" name="entity" value="llc" checked> LLC</label>
    <label><input type="radio" name="entity" value="corp"> Corporation</label>
    <label><input type="radio" name="entity" value="sole"> Sole proprietor</label>
  </fieldset>
  <button type="submit" class="btn btn-primary">Save tax details</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="twofa-form" action="/2fa" method="post">
  <h2>Two-factor authentication</h2>
  <p>Enter the 6-digit code from your authenticator app.</p>
  <label class="visually-hidden" for="otp">Verification code</label>
  <input type="text" id="otp" name="otp" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required>
  <button type="submit" class="btn btn-primary">Verify</button>
  <p class="hint">Didn't get a code? <a href="/2fa/resend">Resend</a></p>
</form>`, [
  {},
], 'forms');

add(() => `<form class="api-key-form" action="/api-keys" method="post">
  <h2>Create an API key</h2>
  <label for="key-name">Key name</label>
  <input type="text" id="key-name" name="name" required placeholder="e.g. staging-ci">
  <label for="key-scope">Scopes</label>
  <select id="key-scope" name="scope">
    <option value="read">Read only</option>
    <option value="read_write">Read & write</option>
    <option value="admin">Admin</option>
  </select>
  <label for="key-expiry">Expires</label>
  <input type="date" id="key-expiry" name="expires" min="2025-01-01">
  <button type="submit" class="btn btn-primary">Generate key</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="job-form" action="/apply" method="post">
  <h2>Apply for this role</h2>
  <label for="cand-name">Full name</label>
  <input type="text" id="cand-name" name="name" required autocomplete="name">
  <label for="cand-email">Email</label>
  <input type="email" id="cand-email" name="email" required autocomplete="email">
  <label for="cand-resume">Resume</label>
  <input type="file" id="cand-resume" name="resume" accept=".pdf,.doc,.docx" required>
  <label for="cand-linkedin">LinkedIn (optional)</label>
  <input type="url" id="cand-linkedin" name="linkedin" placeholder="https://linkedin.com/in/...">
  <button type="submit" class="btn btn-primary">Submit application</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="multi-step" action="/wizard" method="post">
  <ol class="steps">
    <li class="done">Account</li>
    <li class="active">Team</li>
    <li>Plan</li>
  </ol>
  <fieldset>
    <legend>Team details</legend>
    <label for="team-name">Team name</label>
    <input type="text" id="team-name" name="team_name" required>
    <label for="team-slug">URL slug</label>
    <input type="text" id="team-slug" name="team_slug" pattern="[a-z0-9-]+" placeholder="my-team">
    <label for="team-size">Team size</label>
    <select id="team-size" name="size">
      <option>1–5</option>
      <option selected>6–25</option>
      <option>26–100</option>
      <option>100+</option>
    </select>
  </fieldset>
  <div class="form-nav">
    <button type="button" class="btn">Back</button>
    <button type="submit" class="btn btn-primary">Continue</button>
  </div>
</form>`, [
  {},
], 'forms');

add(({ name }) => `<article class="product-card">
  <img src="/img/desk-lamp.jpg" alt="${name}" width="300" height="200">
  <div class="card-body">
    <h3 class="card-title">${name}</h3>
    <p class="card-price">$79.00</p>
    <p class="card-sub">Warm dimmable light, USB-C charging port.</p>
    <button type="button" class="btn">Add to cart</button>
  </div>
</article>`, [
  { name: 'Halo Desk Lamp' },
  { name: 'Cinder Floor Lamp' },
], 'cards');

add(({ title, author, reads }) => `<article class="story-card">
  <h3 class="card-title"><a href="/stories/${title.toLowerCase().replace(/\s+/g, '-')}">${title}</a></h3>
  <p class="card-sub">by ${author}</p>
  <p class="card-meta">${reads} reads</p>
</article>`, [
  { title: 'The Ferry at Dawn', author: 'Ingrid Halvorsen', reads: '3,402' },
  { title: 'Notes from a Winter Garden', author: 'Ravi Menon', reads: '1,887' },
  { title: "The Cartographer's Daughter", author: 'Lena Fischer', reads: '5,120' },
], 'cards');

add(({ title, org, amount }) => `<article class="campaign-card">
  <img src="/img/campaign.jpg" alt="" width="360" height="200">
  <div class="card-body">
    <h3 class="card-title">${title}</h3>
    <p class="card-sub">${org}</p>
    <progress value="${amount}" max="100" aria-label="${amount}% funded">${amount}%</progress>
    <p class="card-meta">${amount}% funded</p>
    <a class="btn btn-primary" href="/campaigns/support">Support</a>
  </div>
</article>`, [
  { title: 'Community garden for Elm Park', org: 'Elm Park Collective', amount: '64' },
  { title: 'Reusable library totes', org: 'Friends of the Library', amount: '91' },
], 'cards');

add(({ plan, price }) => `<div class="plan-card">
  <h3 class="card-title">${plan}</h3>
  <p class="card-price">$${price}<span class="per">/year</span></p>
  <ul class="feature-list">
    <li>Unlimited projects</li>
    <li>Priority queue builds</li>
    <li>Advanced analytics</li>
  </ul>
  <a class="btn btn-primary" href="/plans/${plan.toLowerCase()}">Upgrade</a>
</div>`, [
  { plan: 'Growth', price: '240' },
  { plan: 'Scale', price: '600' },
], 'cards');

add(({ title, date }) => `<article class="notice-card">
  <p class="card-tag">Notice</p>
  <h3 class="card-title">${title}</h3>
  <p class="card-meta">Effective <time datetime="${date}">${date}</time></p>
  <a class="card-link" href="/notices/read">Read the full notice</a>
</article>`, [
  { title: 'Changes to our data retention policy', date: '2025-04-01' },
  { title: 'Scheduled maintenance: April 12', date: '2025-04-12' },
], 'cards');

add(({ course, level, lessons }) => `<article class="course-card">
  <p class="card-tag">${level}</p>
  <h3 class="card-title">${course}</h3>
  <p class="card-meta">${lessons} lessons · Certificate included</p>
  <a class="btn" href="/learn/enroll">Enroll</a>
</article>`, [
  { course: 'Design Systems in Practice', level: 'Intermediate', lessons: '28' },
  { course: 'Reliable Distributed Systems', level: 'Advanced', lessons: '34' },
], 'cards');

add(({ name, next }) => `<article class="visit-card">
  <p class="card-sub">Next appointment</p>
  <h3 class="card-title">${name}</h3>
  <p class="card-meta">${next}</p>
  <a class="card-link" href="/schedule">Reschedule</a>
</article>`, [
  { name: 'Dr. Amara Cole — Annual checkup', next: 'Fri, Mar 21 · 09:30' },
  { name: 'Dr. Jonas Berg — Physio session', next: 'Mon, Mar 24 · 14:15' },
], 'cards');

add(() => `<table class="availability">
  <caption>Room availability — Harbourview Inn</caption>
  <thead>
    <tr>
      <th scope="col">Room</th>
      <th scope="col">Mar 15</th>
      <th scope="col">Mar 16</th>
      <th scope="col">Mar 17</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Single</th><td>Free</td><td>Booked</td><td>Free</td></tr>
    <tr><th scope="row">Double</th><td>Booked</td><td>Free</td><td>Free</td></tr>
    <tr><th scope="row">Suite</th><td>Free</td><td>Free</td><td>Booked</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="kpis">
  <caption>Weekly report — week 11</caption>
  <thead>
    <tr>
      <th scope="col">Metric</th>
      <th scope="col">This week</th>
      <th scope="col">Last week</th>
      <th scope="col">Δ</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Signups</th><td>1,248</td><td>1,102</td><td>+13%</td></tr>
    <tr><th scope="row">Activations</th><td>932</td><td>870</td><td>+7%</td></tr>
    <tr><th scope="row">Churn</th><td>41</td><td>55</td><td>−25%</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="deps">
  <caption>Dependency health</caption>
  <thead>
    <tr>
      <th scope="col">Package</th>
      <th scope="col">Version</th>
      <th scope="col">Latest</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>express</td><td>4.19.2</td><td>4.21.2</td><td>Update available</td></tr>
    <tr><td>lodash</td><td>4.17.21</td><td>4.17.21</td><td>Up to date</td></tr>
    <tr><td>axios</td><td>1.6.8</td><td>1.7.9</td><td>Update available</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="tickets">
  <caption>Open support tickets</caption>
  <thead>
    <tr>
      <th scope="col">ID</th>
      <th scope="col">Subject</th>
      <th scope="col">Status</th>
      <th scope="col">Age</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>#4821</td><td>Webhook not delivered for refunds</td><td>Investigating</td><td>2h</td></tr>
    <tr><td>#4820</td><td>Export times out on large orgs</td><td>In progress</td><td>1d</td></tr>
    <tr><td>#4819</td><td>Cannot rotate API key</td><td>Awaiting reply</td><td>3d</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="milestones">
  <caption>Project milestones</caption>
  <thead>
    <tr>
      <th scope="col">Milestone</th>
      <th scope="col">Owner</th>
      <th scope="col">Due</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Beta onboarding flow</td><td>Ines</td><td>Apr 4</td><td>On track</td></tr>
    <tr><td>Stripe migration</td><td>Marcus</td><td>Apr 18</td><td>At risk</td></tr>
    <tr><td>Docs v2</td><td>Dana</td><td>May 2</td><td>On track</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<section class="hero hero-split">
  <div class="hero-copy">
    <p class="card-tag">New: Realtime sync</p>
    <h1>Work together without the lag</h1>
    <p class="lead">See teammates' cursors, comments and changes as they happen.</p>
    <a class="btn btn-primary" href="/signup">Try it free</a>
  </div>
  <img src="/img/hero-editor.png" alt="Collaborative editor in action" width="520" height="360">
</section>`, [
  {},
], 'sections');

add(() => `<section class="testimonials" aria-labelledby="t-heading">
  <h2 id="t-heading">What customers say</h2>
  <div class="testimonial-grid">
    <figure>
      <blockquote>
        <p>Support answered within four minutes — on a Sunday. That alone sold us.</p>
      </blockquote>
      <figcaption>— Priya Sharma, VP Engineering at Northwind</figcaption>
    </figure>
    <figure>
      <blockquote>
        <p>We replaced three tools with this one. The ROI was obvious by month two.</p>
      </blockquote>
      <figcaption>— Diego Fuentes, CTO at Relay Systems</figcaption>
    </figure>
  </div>
</section>`, [
  {},
], 'sections');

add(() => `<section class="how-it-works">
  <h2>From idea to production in one afternoon</h2>
  <ol class="process-steps">
    <li>
      <h3>Import your repository</h3>
      <p>We detect your stack and generate a build pipeline automatically.</p>
    </li>
    <li>
      <h3>Deploy to preview</h3>
      <p>Every pull request gets its own URL with real data wiring.</p>
    </li>
    <li>
      <h3>Promote to production</h3>
      <p>One click, zero downtime, instant rollback if needed.</p>
    </li>
  </ol>
</section>`, [
  {},
], 'sections');

add(() => `<section class="values" aria-labelledby="values-heading">
  <h2 id="values-heading">What we stand for</h2>
  <ul class="value-list">
    <li>
      <h3>Clarity over cleverness</h3>
      <p>Simple code, plain words, honest numbers.</p>
    </li>
    <li>
      <h3>Boring reliability</h3>
      <p>The most exciting outage is the one that never happens.</p>
    </li>
    <li>
      <h3>Default to open</h3>
      <p>Public roadmaps, transparent pricing, readable changelogs.</p>
    </li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<article class="guide">
  <header>
    <p class="card-tag">Guide</p>
    <h1>Migrating from Heroku to Acme</h1>
    <p class="post-meta">By <a href="/authors/marcus">Marcus Webb</a> · 20 min read</p>
  </header>
  <p>This guide walks through a typical migration for a Node.js app with a
  managed Postgres database, including the parts people usually forget:
  background workers, cron jobs and attachments.</p>
  <h2>Before you start</h2>
  <ul>
    <li>Export your environment variables</li>
    <li>Take a snapshot of your database</li>
    <li>Note any add-on services you depend on</li>
  </ul>
</article>`, [
  {},
], 'sections');

add(() => `<section class="press-kit">
  <h2>Press kit</h2>
  <p>Logos, screenshots and brand assets for journalists and partners.</p>
  <ul class="asset-list">
    <li><a href="/press/logo-svg.zip">Logo (SVG)</a></li>
    <li><a href="/press/screenshots.zip">Product screenshots</a></li>
    <li><a href="/press/fact-sheet.pdf">Fact sheet</a></li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<aside class="related">
  <h2>More reading</h2>
  <ul>
    <li><a href="/blog/vacuum-tips">Autovacuum settings that work</a></li>
    <li><a href="/blog/index-strategies">Index strategies for high write loads</a></li>
    <li><a href="/blog/connection-pools">Postgres connection pooling done right</a></li>
    <li><a href="/blog/pitr-drills">Restore drills: practice your point-in-time recovery</a></li>
  </ul>
</aside>`, [
  {},
], 'lists');

add(() => `<section class="checklist" aria-label="Launch checklist">
  <h2>Launch checklist</h2>
  <ul>
    <li><label><input type="checkbox" checked> SSL certificate installed</label></li>
    <li><label><input type="checkbox" checked> Custom domain verified</label></li>
    <li><label><input type="checkbox"> Error monitoring configured</label></li>
    <li><label><input type="checkbox"> Backup schedule enabled</label></li>
    <li><label><input type="checkbox"> Status page updated</label></li>
  </ul>
</section>`, [
  {},
], 'lists');

add(() => `<div class="command-palette" role="search">
  <label class="visually-hidden" for="cmd-input">Search commands</label>
  <input type="text" id="cmd-input" placeholder="Type a command or search...">
  <ul class="command-list">
    <li><kbd>↑</kbd><kbd>↓</kbd> to navigate</li>
    <li><kbd>↵</kbd> to select</li>
    <li><kbd>esc</kbd> to close</li>
  </ul>
</div>`, [
  {},
], 'components');

add(() => `<div class="tooltip-demo" aria-label="Tooltip example">
  <button type="button" aria-describedby="tooltip">Hover me</button>
  <span id="tooltip" role="tooltip">Saves your changes automatically.</span>
</div>`, [
  {},
], 'components');

add(() => `<div class="spinner" role="status" aria-label="Loading">
  <span class="spinner-ring" aria-hidden="true"></span>
  <p>Fetching deployment status...</p>
</div>`, [
  {},
], 'components');

add(() => `<div class="carousel" aria-roledescription="carousel" aria-label="Highlights">
  <div class="slide" role="group" aria-roledescription="slide">
    <h2>Introducing Realtime Sync</h2>
    <p>Collaborate with zero-lag cursors and comments.</p>
  </div>
  <div class="carousel-controls">
    <button type="button" aria-label="Previous slide">Previous</button>
    <button type="button" aria-label="Next slide">Next</button>
  </div>
</div>`, [
  {},
], 'components');

add(() => `<div class="share" aria-label="Share this article">
  <span>Share:</span>
  <a href="https://x.com/intent/post?url=..." aria-label="Share on X">X</a>
  <a href="https://www.linkedin.com/sharing/share-offsite/?url=..." aria-label="Share on LinkedIn">LinkedIn</a>
  <a href="mailto:?subject=Great%20read&body=..." aria-label="Share by email">Email</a>
</div>`, [
  {},
], 'components');

add(() => `<ul class="stats-mini" aria-label="Repository stats">
  <li><strong>1,204</strong> stars</li>
  <li><strong>142</strong> forks</li>
  <li><strong>38</strong> open issues</li>
  <li><strong>12</strong> contributors</li>
</ul>`, [
  {},
], 'components');

add(() => `<div class="cookie-banner" role="region" aria-label="Cookie consent">
  <p>We use cookies to improve your experience and measure usage.</p>
  <div class="cookie-actions">
    <button type="button" class="btn btn-primary">Accept all</button>
    <button type="button" class="btn">Necessary only</button>
    <a href="/privacy">Learn more</a>
  </div>
</div>`, [
  {},
], 'components');

add(() => `<div class="skeleton" aria-label="Loading content">
  <div class="skeleton-line w-60"></div>
  <div class="skeleton-line w-90"></div>
  <div class="skeleton-line w-75"></div>
  <p class="visually-hidden">Content is loading...</p>
</div>`, [
  {},
], 'components');

add(() => `<section class="auth-steps" aria-label="Setup progress">
  <h2>Secure your account</h2>
  <ol class="steps">
    <li class="done"><a href="/security/password">Set a strong password</a></li>
    <li class="active"><a href="/security/2fa" aria-current="step">Enable two-factor auth</a></li>
    <li>Add a recovery email</li>
  </ol>
</section>`, [
  {},
], 'components');

add(() => `<div class="version-banner">
  <p><strong>v2.4.0 is available.</strong> Includes realtime sync and the new
  dashboard. <a href="/changelog/2-4-0">What's new</a></p>
  <button type="button" class="btn">Update now</button>
</div>`, [
  {},
], 'components');

add(() => `<section class="widget" aria-label="Deploy history">
  <h2>Recent deploys</h2>
  <ul class="widget-list">
    <li><a href="/deploys/901">web@v2.4.0</a> <time datetime="2025-03-12T09:41:00">09:41</time></li>
    <li><a href="/deploys/900">api@v1.4.0</a> <time datetime="2025-03-12T09:12:00">09:12</time></li>
    <li><a href="/deploys/899">worker@v2.1.0</a> <time datetime="2025-03-12T08:55:00">08:55</time></li>
  </ul>
</section>`, [
  {},
], 'components');

add(() => `<section class="widget" aria-label="Spending summary">
  <h2>Spending this month</h2>
  <p class="stat-value">$1,284.50</p>
  <p class="stat-trend up">+8% vs last month</p>
  <a class="card-link" href="/billing/usage">View usage breakdown</a>
</section>`, [
  {},
], 'components');

add(() => `<section class="widget" aria-label="On-call rotation">
  <h2>This week's on-call</h2>
  <p><strong>Primary:</strong> Elena Petrova</p>
  <p><strong>Secondary:</strong> Tomás Rivera</p>
  <p class="card-meta">Rotates every Monday at 09:00 UTC</p>
</section>`, [
  {},
], 'components');

add(() => `<section class="widget" aria-label="Open incidents">
  <h2>Open incidents</h2>
  <ul>
    <li><span class="badge badge-amber">Degraded</span> Log streaming in eu-west-1</li>
    <li><span class="badge badge-amber">Investigating</span> Elevated 5xx on edge</li>
  </ul>
  <a class="card-link" href="/status">Status page</a>
</section>`, [
  {},
], 'components');

add(() => `<section class="widget" aria-label="Upcoming releases">
  <h2>Upcoming releases</h2>
  <ul>
    <li><strong>v2.5.0</strong> — offline mode · Mar 28</li>
    <li><strong>v2.6.0</strong> — audit export · Apr 15</li>
  </ul>
</section>`, [
  {},
], 'components');

add(() => `<table class="sprints">
  <caption>Sprint 14 — progress</caption>
  <thead>
    <tr>
      <th scope="col">Status</th>
      <th scope="col">Count</th>
      <th scope="col">Points</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Done</td><td>18</td><td>62</td></tr>
    <tr><td>In progress</td><td>4</td><td>15</td></tr>
    <tr><td>To do</td><td>7</td><td>24</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<section class="reviews-summary" aria-label="Review summary">
  <h2>Customer reviews</h2>
  <p class="rating" aria-label="Rated 4.6 out of 5">
    <span aria-hidden="true">★★★★★</span> 4.6
  </p>
  <dl class="rating-bars">
    <dt>5 stars</dt><dd><progress value="78" max="100">78%</progress></dd>
    <dt>4 stars</dt><dd><progress value="14" max="100">14%</progress></dd>
    <dt>3 stars</dt><dd><progress value="5" max="100">5%</progress></dd>
    <dt>2 stars</dt><dd><progress value="2" max="100">2%</progress></dd>
    <dt>1 star</dt><dd><progress value="1" max="100">1%</progress></dd>
  </dl>
</section>`, [
  {},
], 'sections');

add(() => `<article class="press-release">
  <header>
    <h1>Acme raises $40M Series B to expand edge platform</h1>
    <p class="post-meta"><time datetime="2025-02-18">February 18, 2025</time> · Portland, OR</p>
  </header>
  <p>Acme, the deployment and hosting platform used by 12,000 teams, today
  announced a $40 million Series B round led by Meridian Capital.</p>
  <p>The funding will accelerate work on the global edge network and expand
  the team across engineering, design and customer success.</p>
</article>`, [
  {},
], 'sections');

add(() => `<section class="pricing-faq">
  <h2>Billing questions</h2>
  <details>
    <summary>Can I switch plans mid-cycle?</summary>
    <p>Yes — upgrades apply immediately with prorated billing; downgrades apply at renewal.</p>
  </details>
  <details>
    <summary>Do you offer annual billing?</summary>
    <p>Yes, annual billing saves 20% compared to monthly.</p>
  </details>
  <details>
    <summary>What payment methods are accepted?</summary>
    <p>We accept all major credit cards, bank transfers and invoicing for Enterprise plans.</p>
  </details>
</section>`, [
  {},
], 'sections');

add(() => `<nav class="pagination pagination-compact" aria-label="Pagination">
  <a href="/docs/part-1" rel="prev">← Part 1</a>
  <span>Part 2 of 4</span>
  <a href="/docs/part-3" rel="next">Part 3 →</a>
</nav>`, [
  {},
], 'components');

add(() => `<div class="inline-code-demo">
  <p>Install with npm: <code>npm install @acme/sdk@latest</code></p>
  <p>Or with pnpm: <code>pnpm add @acme/sdk</code></p>
  <pre><code>import { client } from '@acme/sdk';

const res = await client.orders.list({ limit: 10 });</code></pre>
</div>`, [
  {},
], 'components');

add(() => `<ul class="changelog-list" aria-label="Changelog">
  <li>
    <time datetime="2025-03-10">Mar 10</time>
    <p><strong>v2.4.0</strong> — realtime sync, new dashboard</p>
  </li>
  <li>
    <time datetime="2025-02-24">Feb 24</time>
    <p><strong>v2.3.1</strong> — export fixes, faster cold starts</p>
  </li>
  <li>
    <time datetime="2025-02-10">Feb 10</time>
    <p><strong>v2.3.0</strong> — CSV import, audit log</p>
  </li>
</ul>`, [
  {},
], 'lists');

add(() => `<div class="legend" aria-label="Chart legend">
  <h2 class="visually-hidden">Chart legend</h2>
  <ul>
    <li><span class="swatch swatch-blue"></span> Requests</li>
    <li><span class="swatch swatch-green"></span> Cache hits</li>
    <li><span class="swatch swatch-red"></span> Errors</li>
  </ul>
</div>`, [
  {},
], 'components');

add(() => `<form class="import-form" action="/import" method="post" enctype="multipart/form-data">
  <h2>Import your data</h2>
  <label for="import-file">Choose a file</label>
  <input type="file" id="import-file" name="file" accept=".csv,.json" required>
  <label for="import-format">Format</label>
  <select id="import-format" name="format">
    <option value="csv">CSV</option>
    <option value="json">JSON</option>
    <option value="postgres">Postgres dump</option>
  </select>
  <p class="hint">Files up to 100 MB. Columns are mapped automatically.</p>
  <button type="submit" class="btn btn-primary">Start import</button>
</form>`, [
  {},
], 'forms');

add(() => `<div class="notice-bar" role="note">
  <p>We will be performing maintenance on <time datetime="2025-04-12T02:00:00">April 12, 02:00 UTC</time>.
  Expected duration: 30 minutes.</p>
</div>`, [
  {},
], 'components');

add(() => `<section class="office-hours">
  <h2>Support hours</h2>
  <dl>
    <dt>Email</dt>
    <dd>24/7, response within 4 hours</dd>
    <dt>Chat</dt>
    <dd>Mon–Fri, 08:00–20:00 UTC</dd>
    <dt>Phone (Enterprise)</dt>
    <dd>24/7, dedicated line</dd>
  </dl>
</section>`, [
  {},
], 'sections');

// ===========================================================================
// Batch 3
// ===========================================================================
add(() => `<form class="schedule-form" action="/schedule" method="post">
  <h2>Pick a time</h2>
  <label for="date">Date</label>
  <input type="date" id="date" name="date" required>
  <fieldset>
    <legend>Available slots</legend>
    <label><input type="radio" name="slot" value="09:00"> 09:00</label>
    <label><input type="radio" name="slot" value="10:30"> 10:30</label>
    <label><input type="radio" name="slot" value="13:00" checked> 13:00</label>
    <label><input type="radio" name="slot" value="15:30" disabled> 15:30 (full)</label>
  </fieldset>
  <button type="submit" class="btn btn-primary">Confirm booking</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="password-form" action="/password" method="post">
  <h2>Change password</h2>
  <label for="cur-pass">Current password</label>
  <input type="password" id="cur-pass" name="current" required autocomplete="current-password">
  <label for="new-pass">New password</label>
  <input type="password" id="new-pass" name="new" minlength="10" required autocomplete="new-password">
  <label for="confirm-pass">Confirm new password</label>
  <input type="password" id="confirm-pass" name="confirm" required autocomplete="new-password">
  <button type="submit" class="btn btn-primary">Update password</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="review-form" action="/reviews" method="post">
  <h2>Write a review</h2>
  <p class="card-sub">Aurora Wireless Headphones</p>
  <fieldset>
    <legend>Your rating</legend>
    <label><input type="radio" name="stars" value="5" checked> 5 — Excellent</label>
    <label><input type="radio" name="stars" value="4"> 4 — Good</label>
    <label><input type="radio" name="stars" value="3"> 3 — Average</label>
    <label><input type="radio" name="stars" value="2"> 2 — Poor</label>
    <label><input type="radio" name="stars" value="1"> 1 — Bad</label>
  </fieldset>
  <label for="review-title">Title</label>
  <input type="text" id="review-title" name="title" required placeholder="Great sound, comfy fit">
  <label for="review-body">Review</label>
  <textarea id="review-body" name="body" rows="5" required></textarea>
  <button type="submit" class="btn btn-primary">Submit review</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="waitlist-form" action="/waitlist" method="post">
  <h2>Join the waitlist</h2>
  <p>We're rolling out access in waves. Leave your email and we'll notify you.</p>
  <label for="wl-email">Email</label>
  <input type="email" id="wl-email" name="email" required>
  <label for="wl-role">What best describes you?</label>
  <select id="wl-role" name="role">
    <option value="engineer">Software engineer</option>
    <option value="designer">Designer</option>
    <option value="pm">Product manager</option>
    <option value="other">Other</option>
  </select>
  <button type="submit" class="btn btn-primary">Notify me</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="unsubscribe-form" action="/unsubscribe" method="post">
  <h2>Unsubscribe</h2>
  <p>We're sorry to see you go. Tell us why (optional):</p>
  <label><input type="checkbox" name="reason" value="too-many"> Too many emails</label>
  <label><input type="checkbox" name="reason" value="irrelevant"> Content isn't relevant</label>
  <label><input type="checkbox" name="reason" value="other"> Other</label>
  <button type="submit" class="btn btn-primary">Unsubscribe me</button>
  <p class="hint">You can also <a href="/email-preferences">update your preferences</a> instead.</p>
</form>`, [
  {},
], 'forms');

add(() => `<form class="referral-form" action="/refer" method="post">
  <h2>Invite a friend, earn credit</h2>
  <label for="ref-name">Their name</label>
  <input type="text" id="ref-name" name="name" required>
  <label for="ref-email">Their email</label>
  <input type="email" id="ref-email" name="email" required>
  <p class="hint">You both get $10 in credits when they make their first purchase.</p>
  <button type="submit" class="btn btn-primary">Send invitation</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="preorder-form" action="/preorder" method="post">
  <h2>Pre-order the Series 6</h2>
  <label for="po-email">Email</label>
  <input type="email" id="po-email" name="email" required>
  <label for="po-model">Model</label>
  <select id="po-model" name="model">
    <option value="41-gps">41 mm, GPS — $399</option>
    <option value="45-gps">45 mm, GPS — $429</option>
    <option value="45-cellular">45 mm, GPS + Cellular — $499</option>
  </select>
  <label for="po-band">Band</label>
  <select id="po-band" name="band">
    <option>Sport loop</option>
    <option>Solo loop</option>
    <option>Braided solo loop</option>
  </select>
  <button type="submit" class="btn btn-primary">Pre-order</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="rsvp-form" action="/rsvp" method="post">
  <h2>RSVP — Spring Community Meetup</h2>
  <p class="card-sub">April 24, 18:00 · Riverside Hall</p>
  <fieldset>
    <legend>Will you attend?</legend>
    <label><input type="radio" name="attend" value="yes" checked> Yes, I'll be there</label>
    <label><input type="radio" name="attend" value="maybe"> Maybe</label>
    <label><input type="radio" name="attend" value="no"> No</label>
  </fieldset>
  <label for="rsvp-guests">Plus-ones</label>
  <input type="number" id="rsvp-guests" name="guests" min="0" max="3" value="0">
  <label for="rsvp-note">Dietary notes</label>
  <input type="text" id="rsvp-note" name="note" placeholder="e.g. vegetarian">
  <button type="submit" class="btn btn-primary">Send RSVP</button>
</form>`, [
  {},
], 'forms');

add(({ ep, title }) => `<article class="podcast-card">
  <p class="card-tag">Episode ${ep}</p>
  <h3 class="card-title">${title}</h3>
  <p class="card-meta">42 min · The Build Log</p>
  <audio controls preload="none" aria-label="Listen to episode ${ep}">
    <source src="/media/ep${ep}.mp3" type="audio/mpeg">
  </audio>
</article>`, [
  { ep: '84', title: 'Postgres at the Edge' },
  { ep: '85', title: 'Designing Calm Dashboards' },
], 'cards');

add(({ title, dept, location }) => `<article class="job-card">
  <h3 class="card-title"><a href="/careers/${title.toLowerCase().replace(/\s+/g, '-')}">${title}</a></h3>
  <p class="card-sub">${dept}</p>
  <p class="card-meta">${location} · Remote-friendly</p>
  <a class="btn" href="/careers/apply">Apply</a>
</article>`, [
  { title: 'Senior Backend Engineer', dept: 'Platform', location: 'Berlin or remote' },
  { title: 'Product Designer', dept: 'Design', location: 'Portland or remote' },
], 'cards');

add(({ title, goal, current }) => `<article class="goal-card">
  <h3 class="card-title">${title}</h3>
  <p class="card-price">$${current} <span class="per">of $${goal}</span></p>
  <progress value="${current}" max="${goal}" aria-label="${Math.round(current / goal * 100)}% saved"></progress>
  <p class="card-meta">${Math.round(current / goal * 100)}% of goal</p>
</article>`, [
  { title: 'Trip to Iceland', goal: '4000', current: '3150' },
  { title: 'New camera lens', goal: '1200', current: '840' },
], 'cards');

add(({ title, author, pages }) => `<article class="book-card">
  <h3 class="card-title"><cite>${title}</cite></h3>
  <p class="card-sub">${author}</p>
  <p class="card-meta">${pages} pages · Paperback</p>
  <a class="btn" href="/books/${title.toLowerCase().replace(/\s+/g, '-')}">View details</a>
</article>`, [
  { title: 'The Midnight Library', author: 'Matt Haig', pages: '304' },
  { title: 'Project Hail Mary', author: 'Andy Weir', pages: '496' },
], 'cards');

add(({ store, miles }) => `<article class="location-card">
  <h3 class="card-title">${store}</h3>
  <address>142 Main Street, Suite 3</address>
  <p class="card-meta">Open today 08:00–20:00 · ${miles} mi away</p>
  <a class="card-link" href="/directions">Get directions</a>
</article>`, [
  { store: 'Bluebird Coffee — Downtown', miles: '0.4' },
  { store: 'Bluebird Coffee — Riverside', miles: '2.1' },
], 'cards');

add(() => `<table class="compare">
  <caption>Compare: Acme vs. alternatives</caption>
  <thead>
    <tr>
      <th scope="col">Capability</th>
      <th scope="col">Acme</th>
      <th scope="col">Alt A</th>
      <th scope="col">Alt B</th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">Instant rollbacks</th><td>Yes</td><td>Yes</td><td>No</td></tr>
    <tr><th scope="row">Preview URLs</th><td>Yes</td><td>No</td><td>Yes</td></tr>
    <tr><th scope="row">Usage-based billing</th><td>Yes</td><td>No</td><td>Yes</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="currency">
  <caption>Exchange rates — EUR base</caption>
  <thead>
    <tr>
      <th scope="col">Currency</th>
      <th scope="col">Rate</th>
      <th scope="col">Updated</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>USD</td><td>1.0852</td><td>12:00 UTC</td></tr>
    <tr><td>GBP</td><td>0.8551</td><td>12:00 UTC</td></tr>
    <tr><td>JPY</td><td>162.41</td><td>12:00 UTC</td></tr>
    <tr><td>CAD</td><td>1.4723</td><td>12:00 UTC</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="attendance">
  <caption>Workshop attendance</caption>
  <thead>
    <tr>
      <th scope="col">Session</th>
      <th scope="col">Registered</th>
      <th scope="col">Attended</th>
      <th scope="col">Rate</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Intro to Kubernetes</td><td>64</td><td>51</td><td>80%</td></tr>
    <tr><td>SQL for Analysts</td><td>88</td><td>77</td><td>88%</td></tr>
    <tr><td>Design Systems Lab</td><td>40</td><td>35</td><td>88%</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<section class="case-study">
  <p class="card-tag">Case study</p>
  <h2>How Vela Retail cut deploy time by 94%</h2>
  <blockquote>
    <p>What used to take a full release day now ships while we're still in standup.</p>
  </blockquote>
  <p class="post-meta">— Ines Costa, Head of Data, Vela Retail</p>
  <a class="card-link" href="/case-studies/vela-retail">Read the full story</a>
</section>`, [
  {},
], 'sections');

add(() => `<section class="integrations" aria-labelledby="integrations-heading">
  <h2 id="integrations-heading">Integrates with your stack</h2>
  <ul class="integration-list">
    <li><a href="/integrations/github">GitHub</a></li>
    <li><a href="/integrations/slack">Slack</a></li>
    <li><a href="/integrations/datadog">Datadog</a></li>
    <li><a href="/integrations/pagerduty">PagerDuty</a></li>
    <li><a href="/integrations/stripe">Stripe</a></li>
    <li><a href="/integrations/terraform">Terraform</a></li>
  </ul>
  <p><a class="card-link" href="/integrations">Browse all 40+ integrations</a></p>
</section>`, [
  {},
], 'sections');

add(() => `<section class="security" aria-labelledby="security-heading">
  <h2 id="security-heading">Security you can rely on</h2>
  <ul class="security-list">
    <li><strong>SOC 2 Type II</strong> — audited annually</li>
    <li><strong>Encryption at rest</strong> — AES-256</li>
    <li><strong>TLS 1.3</strong> — everywhere, by default</li>
    <li><strong>SSO / SAML</strong> — on Enterprise plans</li>
    <li><strong>Pen-tested</strong> — by independent firms, twice a year</li>
  </ul>
  <a class="card-link" href="/security">Read the security overview</a>
</section>`, [
  {},
], 'sections');

add(() => `<section class="roadmap" aria-labelledby="roadmap-heading">
  <h2 id="roadmap-heading">Public roadmap</h2>
  <ul class="roadmap-list">
    <li><span class="badge">In progress</span> Offline mode for the mobile app</li>
    <li><span class="badge">Planned</span> Audit log export API</li>
    <li><span class="badge">Under consideration</span> Self-hosted edge nodes</li>
  </ul>
  <p><a class="card-link" href="/roadmap">See the full roadmap</a></p>
</section>`, [
  {},
], 'sections');

add(() => `<section class="awards">
  <h2>Recognition</h2>
  <ul class="award-list">
    <li>🏆 Best Developer Tool — Dev Awards 2024</li>
    <li>⭐ Top Rated on the App Directory — 2024</li>
    <li>🚀 Fastest Growing Startup — 2023</li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<section class="careers-hero">
  <h1>Build the boring-critical stuff</h1>
  <p class="lead">We're a small team shipping infrastructure that thousands of
  companies depend on. Remote-first, async-friendly, no crunch.</p>
  <a class="btn btn-primary" href="/careers/openings">See open roles</a>
  <p class="hint">5 open roles · 40 people · 4 time zones</p>
</section>`, [
  {},
], 'sections');

add(() => `<div class="shortcuts" aria-label="Keyboard shortcuts">
  <h2>Keyboard shortcuts</h2>
  <ul class="shortcut-list">
    <li><kbd>g</kbd> <kbd>d</kbd> Go to dashboard</li>
    <li><kbd>c</kbd> New deploy</li>
    <li><kbd>/</kbd> Focus search</li>
    <li><kbd>?</kbd> Show this menu</li>
  </ul>
</div>`, [
  {},
], 'components');

add(() => `<div class="countdown" aria-label="Event countdown">
  <h2>Launch in</h2>
  <p class="countdown-grid">
    <span><strong>12</strong> days</span>
    <span><strong>08</strong> hours</span>
    <span><strong>44</strong> min</span>
  </p>
</div>`, [
  {},
], 'components');

add(() => `<nav class="toc" aria-label="Table of contents">
  <h2>On this page</h2>
  <ol>
    <li><a href="#install">Installation</a></li>
    <li><a href="#quickstart">Quickstart</a></li>
    <li><a href="#config">Configuration</a></li>
    <li><a href="#deploy">Deploying</a></li>
    <li><a href="#troubleshoot">Troubleshooting</a></li>
  </ol>
</nav>`, [
  {},
], 'components');

add(() => `<div class="code-block">
  <div class="code-head">
    <span>main.ts</span>
    <button type="button" class="btn btn-small">Copy</button>
  </div>
  <pre><code>export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}</code></pre>
</div>`, [
  {},
], 'components');

add(() => `<div class="toggle-group" aria-label="View mode">
  <button type="button" class="toggle active" aria-pressed="true">List</button>
  <button type="button" class="toggle" aria-pressed="false">Grid</button>
  <button type="button" class="toggle" aria-pressed="false">Calendar</button>
</div>`, [
  {},
], 'components');

add(() => `<div class="swatches" aria-label="Brand colors">
  <h2 class="visually-hidden">Brand colors</h2>
  <button type="button" class="swatch" style="background:#2563eb" aria-label="Blue #2563eb"></button>
  <button type="button" class="swatch" style="background:#16a34a" aria-label="Green #16a34a"></button>
  <button type="button" class="swatch" style="background:#f59e0b" aria-label="Amber #f59e0b"></button>
  <button type="button" class="swatch" style="background:#dc2626" aria-label="Red #dc2626"></button>
</div>`, [
  {},
], 'components');

add(() => `<dl class="definitions">
  <dt>Idempotent</dt>
  <dd>Safe to run multiple times with the same result.</dd>
  <dt>Backpressure</dt>
  <dd>Slowing down a producer when consumers can't keep up.</dd>
  <dt>Cold start</dt>
  <dd>Latency incurred when a function runs for the first time.</dd>
</dl>`, [
  {},
], 'components');

add(() => `<ul class="menu-list">
  <li><span class="dish">Breakfast burrito</span><span class="price">$9.50</span></li>
  <li><span class="dish">Avocado toast</span><span class="price">$7.00</span></li>
  <li><span class="dish">Seasonal fruit bowl</span><span class="price">$6.50</span></li>
  <li><span class="dish">Oat latte</span><span class="price">$4.75</span></li>
</ul>`, [
  {},
], 'lists');

add(() => `<section class="benefits" aria-label="Plan benefits">
  <h2>Why teams switch</h2>
  <ul class="benefit-list">
    <li>Deploy in under 60 seconds</li>
    <li>Zero-config previews for every PR</li>
    <li>One-click rollbacks</li>
    <li>Unlimited team members on every plan</li>
    <li>Free SSL and custom domains</li>
  </ul>
</section>`, [
  {},
], 'lists');

add(() => `<div class="newsletter-email" role="article">
  <header>
    <img src="/img/logo-email.png" alt="Acme" width="120" height="32">
    <h1>Your weekly digest</h1>
  </header>
  <p>Issue #14 — March 14, 2025</p>
  <h2>In this issue</h2>
  <ol>
    <li>Realtime sync is now GA</li>
    <li>New pricing for teams</li>
    <li>Community highlight of the week</li>
  </ol>
  <a class="btn btn-primary" href="/newsletter/14">Read on the web</a>
  <footer><p>You're receiving this because you subscribed. <a href="/unsubscribe">Unsubscribe</a></p></footer>
</div>`, [
  {},
], 'lists');

add(() => `<article class="tutorial">
  <header>
    <p class="card-tag">Tutorial</p>
    <h1>Build a rate limiter in 10 minutes</h1>
  </header>
  <p>We'll build a fixed-window rate limiter with Redis using nothing but
  an <code>INCR</code> and an <code>EXPIRE</code>.</p>
  <ol>
    <li>Set up the Redis client</li>
    <li>Write the window check</li>
    <li>Wire it into the middleware</li>
  </ol>
  <p>Full code is on <a href="https://github.com/acme/rate-limit-demo">GitHub</a>.</p>
</article>`, [
  {},
], 'sections');

add(() => `<section class="sustainability">
  <h2>Our footprint</h2>
  <p>We've been carbon neutral since 2022, and 78% of our energy comes from
  renewables. Here's how we measure it:</p>
  <ul>
    <li>Emissions per request, tracked monthly</li>
    <li>Hardware refresh cycles extended to 5 years</li>
    <li>Office energy sourced from wind and solar</li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<section class="partners" aria-label="Partners">
  <h2>Built with partners</h2>
  <ul class="logo-list">
    <li>Meridian Capital</li>
    <li>Harbor Cloud</li>
    <li>Quarry Data</li>
    <li>Lumen Security</li>
  </ul>
  <a class="card-link" href="/partners">Become a partner</a>
</section>`, [
  {},
], 'sections');

add(() => `<nav class="footer-nav footer-bottom" aria-label="Legal">
  <ul>
    <li><a href="/privacy">Privacy</a></li>
    <li><a href="/terms">Terms of service</a></li>
    <li><a href="/cookies">Cookie policy</a></li>
    <li><a href="/dpa">DPA</a></li>
    <li><a href="/subprocessors">Subprocessors</a></li>
  </ul>
  <p class="footer-legal">© 2025 Acme Software Inc.</p>
</nav>`, [
  {},
], 'sections');

add(() => `<div class="payment-methods" aria-label="Accepted payment methods">
  <h2 class="visually-hidden">Payment methods</h2>
  <ul>
    <li>Visa</li>
    <li>Mastercard</li>
    <li>American Express</li>
    <li>PayPal</li>
    <li>Apple Pay</li>
    <li>Bank transfer</li>
  </ul>
</div>`, [
  {},
], 'components');

add(() => `<ul class="resource-list">
  <li><a href="/resources/template-architecture.pdf">Architecture template (PDF)</a></li>
  <li><a href="/resources/checklist-security.pdf">Security launch checklist</a></li>
  <li><a href="/resources/guide-migration">Migration guide</a></li>
  <li><a href="/resources/videos/getting-started">Getting started video</a></li>
</ul>`, [
  {},
], 'lists');

add(() => `<div class="announcement" role="status">
  <p>📢 <strong>Acme v2.4 is here.</strong> Realtime sync is now available to
  all workspaces. <a href="/blog/v2-4">Read the announcement →</a></p>
</div>`, [
  {},
], 'components');

add(() => `<section class="office-locations">
  <h2>Our offices</h2>
  <ul>
    <li><strong>Portland</strong> — HQ · 100 Harbor Street</li>
    <li><strong>Berlin</strong> — 12 Boxhagener Str.</li>
    <li><strong>Singapore</strong> — 88 Market St.</li>
  </ul>
  <p class="hint">Most of the team is remote across 4 time zones.</p>
</section>`, [
  {},
], 'sections');

// ===========================================================================
// Batch 4 (final)
// ===========================================================================
add(({ title, players, time }) => `<article class="game-card">
  <h3 class="card-title">${title}</h3>
  <p class="card-sub">${players} players</p>
  <p class="card-meta">${time} · Ages 10+</p>
  <a class="btn" href="/games/${title.toLowerCase().replace(/\s+/g, '-')}">Details</a>
</article>`, [
  { title: 'Harbor Traders', players: '2–4', time: '45 min' },
  { title: 'Signal Fire', players: '3–6', time: '30 min' },
], 'cards');

add(({ name, breed, age }) => `<article class="pet-card">
  <img src="/img/pet-${name.toLowerCase().replace(/\s+/g, '-')}.jpg" alt="${name}, a ${breed}" width="320" height="220">
  <div class="card-body">
    <h3 class="card-title">${name}</h3>
    <p class="card-sub">${breed} · ${age}</p>
    <a class="btn btn-primary" href="/adopt/${name.toLowerCase()}">Meet ${name}</a>
  </div>
</article>`, [
  { name: 'Miso', breed: 'Golden Retriever mix', age: '2 years' },
  { name: 'Nori', breed: 'Domestic shorthair', age: '9 months' },
], 'cards');

add(({ cls, time, coach }) => `<article class="class-card">
  <p class="card-tag">${time}</p>
  <h3 class="card-title">${cls}</h3>
  <p class="card-sub">with ${coach}</p>
  <p class="card-meta">45 min · All levels</p>
  <a class="btn" href="/classes/book">Book a spot</a>
</article>`, [
  { cls: 'Sunrise Vinyasa', time: '06:30', coach: 'Mara' },
  { cls: 'HIIT Express', time: '12:15', coach: 'Dev' },
], 'cards');

add(({ title, date, speaker }) => `<article class="webinar-card">
  <p class="card-tag">Webinar</p>
  <h3 class="card-title">${title}</h3>
  <p class="card-sub">${speaker}</p>
  <p class="card-meta"><time datetime="${date}">${date}</time> · Live + recording</p>
  <a class="btn" href="/webinars/register">Register free</a>
</article>`, [
  { title: 'Designing Accessible Forms', date: '2025-04-02', speaker: 'Amara Okafor' },
  { title: 'Kubernetes for Skeptics', date: '2025-04-09', speaker: 'Tomás Rivera' },
], 'cards');

add(() => `<table class="service-levels">
  <caption>Support service levels</caption>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">First response</th>
      <th scope="col">Channels</th>
      <th scope="col">SLA</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Free</td><td>24h</td><td>Community</td><td>Best effort</td></tr>
    <tr><td>Pro</td><td>4h</td><td>Email, chat</td><td>99.9%</td></tr>
    <tr><td>Enterprise</td><td>30 min</td><td>Email, chat, phone</td><td>99.99%</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="bestsellers">
  <caption>This week's bestsellers</caption>
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Title</th>
      <th scope="col">Author</th>
      <th scope="col">Weeks</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td>The Ferry at Dawn</td><td>Ingrid Halvorsen</td><td>4</td></tr>
    <tr><td>2</td><td>Notes from a Winter Garden</td><td>Ravi Menon</td><td>2</td></tr>
    <tr><td>3</td><td>Signal Lost</td><td>Hana Yoshida</td><td>7</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="shipments">
  <caption>Shipment #SH-48219 tracking</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Status</th>
      <th scope="col">Location</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Mar 14, 08:12</td><td>Out for delivery</td><td>Portland, OR</td></tr>
    <tr><td>Mar 13, 22:40</td><td>Arrived at hub</td><td>Portland, OR</td></tr>
    <tr><td>Mar 13, 05:15</td><td>In transit</td><td>Salt Lake City, UT</td></tr>
    <tr><td>Mar 12, 14:02</td><td>Picked up</td><td>Seattle, WA</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<section class="agenda">
  <h2>Event agenda</h2>
  <ul class="agenda-list">
    <li><time>09:00</time> Registration & coffee</li>
    <li><time>10:00</time> Keynote: The Future of Edge</li>
    <li><time>11:30</time> Breakout sessions</li>
    <li><time>13:00</time> Lunch</li>
    <li><time>14:30</time> Lightning talks</li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<section class="regions">
  <h2>Where we run</h2>
  <ul class="region-list">
    <li><strong>us-east-1</strong> — N. Virginia</li>
    <li><strong>eu-west-1</strong> — Dublin</li>
    <li><strong>ap-southeast-1</strong> — Singapore</li>
    <li><strong>sa-east-1</strong> — São Paulo</li>
  </ul>
  <p class="hint">All regions run the same control plane for consistency.</p>
</section>`, [
  {},
], 'sections');

add(() => `<section class="hours">
  <h2>Opening hours</h2>
  <dl class="hours-list">
    <dt>Mon–Fri</dt><dd>08:00 – 20:00</dd>
    <dt>Saturday</dt><dd>09:00 – 18:00</dd>
    <dt>Sunday</dt><dd>10:00 – 16:00</dd>
  </dl>
</section>`, [
  {},
], 'sections');

add(() => `<form class="calculator" action="/shipping" method="get">
  <h2>Estimate shipping</h2>
  <label for="calc-zip">Destination ZIP</label>
  <input type="text" id="calc-zip" name="zip" pattern="[0-9]{5}" required>
  <label for="calc-weight">Weight (kg)</label>
  <input type="number" id="calc-weight" name="weight" min="0.1" step="0.1" value="1.0" required>
  <label for="calc-speed">Speed</label>
  <select id="calc-speed" name="speed">
    <option value="standard">Standard — 5–7 days</option>
    <option value="express">Express — 2–3 days</option>
    <option value="overnight">Overnight</option>
  </select>
  <button type="submit" class="btn btn-primary">Estimate</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="poll-form" action="/poll" method="post">
  <h2>Which feature next?</h2>
  <fieldset>
    <legend>Vote for one</legend>
    <label><input type="radio" name="vote" value="offline" checked> Offline mode</label>
    <label><input type="radio" name="vote" value="reports"> Scheduled reports</label>
    <label><input type="radio" name="vote" value="sso"> More SSO providers</label>
    <label><input type="radio" name="vote" value="api"> Public REST API</label>
  </fieldset>
  <button type="submit" class="btn btn-primary">Vote</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="quiz-form" action="/quiz" method="post">
  <h2>Quick check: HTML semantics</h2>
  <fieldset>
    <legend>Which element marks the main content?</legend>
    <label><input type="radio" name="q1" value="main" checked> &lt;main&gt;</label>
    <label><input type="radio" name="q1" value="content"> &lt;content&gt;</label>
    <label><input type="radio" name="q1" value="body"> &lt;body&gt;</label>
  </fieldset>
  <fieldset>
    <legend>Which element defines a caption for a figure?</legend>
    <label><input type="radio" name="q2" value="caption"> &lt;caption&gt;</label>
    <label><input type="radio" name="q2" value="figcaption" checked> &lt;figcaption&gt;</label>
    <label><input type="radio" name="q2" value="legend"> &lt;legend&gt;</label>
  </fieldset>
  <button type="submit" class="btn btn-primary">Check answers</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="appointment-form" action="/appointments" method="post">
  <h2>Request an appointment</h2>
  <label for="appt-name">Your name</label>
  <input type="text" id="appt-name" name="name" required>
  <label for="appt-type">Type</label>
  <select id="appt-type" name="type">
    <option value="consult">Consultation</option>
    <option value="followup">Follow-up</option>
    <option value="procedure">Procedure</option>
  </select>
  <label for="appt-notes">Notes</label>
  <textarea id="appt-notes" name="notes" rows="3"></textarea>
  <button type="submit" class="btn btn-primary">Request</button>
</form>`, [
  {},
], 'forms');

add(() => `<ol class="top-ten">
  <li><span class="rank">1</span> Aurora Headphones</li>
  <li><span class="rank">2</span> Halo Desk Lamp</li>
  <li><span class="rank">3</span> Travel Case S</li>
  <li><span class="rank">4</span> Cable Kit</li>
  <li><span class="rank">5</span> Stand for Aurora</li>
</ol>`, [
  {},
], 'lists');

add(() => `<div class="reading-list" aria-label="Reading list">
  <h2>Saved for later</h2>
  <ul>
    <li><a href="/blog/connection-pools">Postgres connection pooling done right</a></li>
    <li><a href="/blog/incident-reviews">Writing incident reviews people actually read</a></li>
    <li><a href="/blog/tracing">Distributed tracing without the headache</a></li>
  </ul>
</div>`, [
  {},
], 'lists');

add(() => `<div class="requirements" aria-label="System requirements">
  <h2>Requirements</h2>
  <ul>
    <li>Node.js 20 or newer</li>
    <li>1 GB of free disk space</li>
    <li>macOS 13+, Windows 11, or a modern Linux distro</li>
    <li>An account at acme.io (free tier works)</li>
  </ul>
</div>`, [
  {},
], 'lists');

add(() => `<div class="progress-tracker" aria-label="Course progress">
  <h2>Course progress</h2>
  <p>Section 4 of 8</p>
  <progress value="50" max="100" aria-label="50% complete">50%</progress>
  <p class="card-meta">5 of 10 lessons completed</p>
</div>`, [
  {},
], 'components');

add(() => `<div class="error-boundary" role="alert">
  <h2>Something went wrong</h2>
  <p>We couldn't load this dashboard. Try again, or
  <a href="/status">check our status page</a>.</p>
  <button type="button" class="btn">Retry</button>
</div>`, [
  {},
], 'components');

add(() => `<div class="empty-inbox" aria-label="Inbox">
  <h2>Inbox zero 🎉</h2>
  <p>You're all caught up. New messages will appear here.</p>
  <a class="card-link" href="/compose">Compose a message</a>
</div>`, [
  {},
], 'components');

add(() => `<div class="loading-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" aria-label="Uploading">
  <span class="bar" style="width:60%"></span>
  <p>Uploading 60%</p>
</div>`, [
  {},
], 'components');

add(() => `<article class="news-item">
  <p class="card-tag">News</p>
  <h2>Acme launches in two new regions</h2>
  <p>ap-south-1 and af-south-1 are now accepting new deployments.</p>
  <p class="post-meta"><time datetime="2025-03-11">March 11, 2025</time></p>
</article>`, [
  {},
], 'sections');

add(() => `<article class="news-item">
  <p class="card-tag">News</p>
  <h2>Community meetup: Berlin, April 24</h2>
  <p>Talks, demos and pizza at Riverside Hall. Free entry, all welcome.</p>
  <a class="card-link" href="/events/berlin-april">RSVP now</a>
</article>`, [
  {},
], 'sections');

add(() => `<div class="badge-grid" aria-label="Badges">
  <span class="badge badge-green">Operational</span>
  <span class="badge badge-blue">New</span>
  <span class="badge badge-gray">Beta</span>
  <span class="badge badge-purple">Pro</span>
</div>`, [
  {},
], 'components');

// ===========================================================================
// Batch 5 (padding)
// ===========================================================================
add(({ title, level }) => `<article class="badge-card">
  <p class="ach-badge">🏅</p>
  <h3 class="card-title">${title}</h3>
  <p class="card-sub">${level}</p>
</article>`, [
  { title: 'Early Adopter', level: 'Joined in the first year' },
  { title: 'Bug Hunter', level: 'Reported 10 verified issues' },
], 'cards');

add(({ title, by, when }) => `<article class="event-listing">
  <p class="card-sub"><time datetime="${when}">${when}</time></p>
  <h3 class="card-title">${title}</h3>
  <p class="card-meta">Hosted by ${by}</p>
  <a class="card-link" href="/events/details">Details</a>
</article>`, [
  { title: 'Open source office hours', by: 'Dana Kwan', when: '2025-03-20' },
  { title: 'Design crit: dashboards', by: 'Amara Okafor', when: '2025-03-27' },
], 'cards');

add(() => `<table class="languages">
  <caption>Top languages in the repo</caption>
  <thead>
    <tr>
      <th scope="col">Language</th>
      <th scope="col">Files</th>
      <th scope="col">Share</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>TypeScript</td><td>412</td><td>61%</td></tr>
    <tr><td>CSS</td><td>88</td><td>12%</td></tr>
    <tr><td>HTML</td><td>41</td><td>9%</td></tr>
    <tr><td>Shell</td><td>23</td><td>5%</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<table class="vouchers">
  <caption>Gift card balances</caption>
  <thead>
    <tr>
      <th scope="col">Code</th>
      <th scope="col">Issued</th>
      <th scope="col">Balance</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>GIFT-1001</td><td>Jan 2024</td><td>$25.00</td></tr>
    <tr><td>GIFT-2044</td><td>Dec 2024</td><td>$75.00</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<form class="coupon-form" action="/coupon" method="post">
  <h2>Have a coupon?</h2>
  <label class="visually-hidden" for="coupon">Coupon code</label>
  <input type="text" id="coupon" name="code" placeholder="WELCOME10">
  <button type="submit" class="btn">Apply</button>
</form>`, [
  {},
], 'forms');

add(() => `<form class="goal-form" action="/goals" method="post">
  <h2>Set a new goal</h2>
  <label for="goal-name">Goal name</label>
  <input type="text" id="goal-name" name="name" required placeholder="e.g. Save for a bike">
  <label for="goal-amount">Target amount</label>
  <input type="number" id="goal-amount" name="amount" min="1" step="0.01" required>
  <label for="goal-date">Target date</label>
  <input type="month" id="goal-date" name="due">
  <button type="submit" class="btn btn-primary">Create goal</button>
</form>`, [
  {},
], 'forms');

add(() => `<section class="glossary" aria-labelledby="glossary-heading">
  <h2 id="glossary-heading">Glossary</h2>
  <dl>
    <dt>Build</dt>
    <dd>The compiled output of your source code.</dd>
    <dt>Edge</dt>
    <dd>Servers close to your users that cache and serve content.</dd>
    <dt>Rollback</dt>
    <dd>Reverting to a previous deploy instantly.</dd>
  </dl>
</section>`, [
  {},
], 'sections');

add(() => `<section class="open-roles">
  <h2>Open roles</h2>
  <ul>
    <li><a href="/careers/senior-backend">Senior Backend Engineer</a> — Berlin or remote</li>
    <li><a href="/careers/product-designer">Product Designer</a> — Portland or remote</li>
    <li><a href="/careers/devrel">Developer Advocate</a> — Remote</li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<div class="autocomplete" role="combobox">
  <label for="repo-search">Find a repository</label>
  <input type="text" id="repo-search" placeholder="e.g. typerouter" aria-autocomplete="list">
  <ul class="autocomplete-list" role="listbox">
    <li role="option">acme/typerouter</li>
    <li role="option">acme/streamline</li>
    <li role="option">acme/docs</li>
  </ul>
</div>`, [
  {},
], 'components');

add(() => `<div class="theme-switcher" aria-label="Theme">
  <span>Theme:</span>
  <button type="button" aria-pressed="false">Light</button>
  <button type="button" aria-pressed="true">Dark</button>
  <button type="button" aria-pressed="false">System</button>
</div>`, [
  {},
], 'components');

add(() => `<ul class="perks">
  <li><strong>4-day work week</strong> — Mondays off</li>
  <li><strong>Home office stipend</strong> — $1,000 / year</li>
  <li><strong>Learning budget</strong> — courses & conferences</li>
  <li><strong>Health cover</strong> — for you and your family</li>
</ul>`, [
  {},
], 'lists');

add(() => `<div class="system-status" role="status">
  <h2 class="visually-hidden">System status</h2>
  <p><span class="status-dot ok" aria-hidden="true"></span> All systems operational</p>
  <p class="card-meta">Last checked 30 seconds ago</p>
</div>`, [
  {},
], 'components');

// ===========================================================================
// Batch 6 (final padding)
// ===========================================================================
add(({ title, mins }) => `<article class="talk-card">
  <p class="card-tag">Talk</p>
  <h3 class="card-title">${title}</h3>
  <p class="card-meta">${mins} min · Main stage</p>
  <a class="card-link" href="/talks/details">Watch recording</a>
</article>`, [
  { title: 'The Art of the Postmortem', mins: '25' },
  { title: 'Rust in the Datacenter', mins: '40' },
], 'cards');

add(() => `<table class="hosts">
  <caption>Podcast hosts</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Role</th>
      <th scope="col">Episodes</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Dana Kwan</td><td>Co-host</td><td>61</td></tr>
    <tr><td>Ravi Menon</td><td>Co-host</td><td>61</td></tr>
    <tr><td>Lena Fischer</td><td>Producer</td><td>61</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<form class="feedback-quick" action="/feedback/quick" method="post">
  <h2>Was this page helpful?</h2>
  <div class="quick-actions">
    <button type="submit" name="vote" value="yes" class="btn">Yes</button>
    <button type="submit" name="vote" value="no" class="btn">No</button>
  </div>
</form>`, [
  {},
], 'forms');

add(() => `<form class="sync-form" action="/sync" method="post">
  <h2>Sync your calendar</h2>
  <p>Connect Google Calendar to get automatic scheduling links.</p>
  <label for="cal-url">Or paste an iCal URL</label>
  <input type="url" id="cal-url" name="url" placeholder="https://cal.example.com/feed.ics">
  <button type="submit" class="btn btn-primary">Connect</button>
</form>`, [
  {},
], 'forms');

add(() => `<section class="highlights">
  <h2>Highlights</h2>
  <ul>
    <li><a href="/blog/v2-4">Announcing v2.4 — realtime sync</a></li>
    <li><a href="/case-studies/vela-retail">Vela Retail: 94% faster deploys</a></li>
    <li><a href="/events/berlin-april">Community meetup in Berlin</a></li>
  </ul>
</section>`, [
  {},
], 'sections');

add(() => `<div class="announcement-bar">
  <!-- Temporarily dismissible; re-shows on next release -->
  <p>🎉 Launch week: new pricing, new regions, and a big surprise on Friday.</p>
</div>`, [
  {},
], 'components');

add(() => `<div class="keyboard-hint" aria-label="Keyboard hint">
  <p><kbd>⌘</kbd> + <kbd>K</kbd> to open the command palette</p>
  <p class="card-meta">Works anywhere in the app</p>
</div>`, [
  {},
], 'components');

add(() => `<div class="refresh-note" role="status">
  <p>New version available. <button type="button" class="link-btn">Refresh</button></p>
  <p class="card-meta">Your changes are saved locally.</p>
</div>`, [
  {},
], 'components');

add(() => `<div class="alert alert-success" role="status">
  <strong>Deployment complete.</strong> web@v2.4.0 is live in production.
  <a href="/deploys/90012">View details</a>
</div>`, [
  {},
], 'components');

add(() => `<div class="progress-demo" aria-label="Onboarding progress">
  <p class="card-meta">Step 7 of 10</p>
  <progress value="7" max="10">70%</progress>
</div>`, [
  {},
], 'components');

// ===========================================================================
// Batch 7 (final)
// ===========================================================================
add(({ name, place }) => `<article class="venue-card">
  <p class="card-tag">Venue</p>
  <h3 class="card-title">${name}</h3>
  <p class="card-sub">${place}</p>
  <p class="card-meta">Capacity 240 · Wheelchair accessible</p>
  <a class="card-link" href="/venues/directions">Directions</a>
</article>`, [
  { name: 'Riverside Hall', place: '142 Riverfront Ave, Portland, OR' },
  { name: 'The Foundry', place: '8 Foundry Lane, Berlin' },
], 'cards');

add(() => `<table class="backup-jobs">
  <caption>Latest backups</caption>
  <thead>
    <tr>
      <th scope="col">Database</th>
      <th scope="col">Size</th>
      <th scope="col">Completed</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>primary</td><td>48 GB</td><td>02:41 UTC</td><td>Success</td></tr>
    <tr><td>reporting</td><td>112 GB</td><td>02:52 UTC</td><td>Success</td></tr>
  </tbody>
</table>`, [
  {},
], 'tables');

add(() => `<div class="onboarding-tip" role="note">
  <h2>Tip</h2>
  <p>Press <kbd>/</kbd> anywhere to jump to search.</p>
  <button type="button" class="btn btn-small">Got it</button>
</div>`, [
  {},
], 'components');

add(() => `<div class="changelog-entry">
  <h2>v2.4.0 — March 10, 2025</h2>
  <h3>New</h3>
  <ul>
    <li>Realtime sync for collaborative editing</li>
    <li>Redesigned dashboard with usage charts</li>
  </ul>
  <h3>Fixed</h3>
  <ul>
    <li>Export timing out for workspaces over 100 GB</li>
    <li>Incorrect totals on the billing page</li>
  </ul>
</div>`, [
  {},
], 'components');

// ===========================================================================
// Write output
// ===========================================================================
if (blocks.length < 300) {
  console.error(`HTML: only ${blocks.length} blocks — need at least 300`);
  process.exit(1);
}

const grouped = new Map();
for (const b of blocks) {
  if (!grouped.has(b.family)) grouped.set(b.family, []);
  grouped.get(b.family).push(b.text);
}

const CHUNK = 30;
let written = 0;
for (const [fam, list] of grouped) {
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    const name = i === 0 ? `${fam}.html` : `${fam}-${i / CHUNK + 1}.html`;
    fs.writeFileSync(path.join(OUT, name), chunk.join('\n\n') + '\n', 'utf8');
    written++;
  }
}

console.log(`HTML: wrote ${blocks.length} blocks across ${written} files -> ${OUT}`);
