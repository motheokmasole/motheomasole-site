// Subscribes someone to Kit.
// Accepts JSON { email, first_name, list } where list is "newsletter" (default) or "iha".
// newsletter -> added to the WILIOM form; iha -> tagged "IHA Waitlist".
// Uses the same Kit v4 API key as posts.js (C_API_SECRET).

const KIT = 'https://api.kit.com/v4';
const LISTS = {
  newsletter: { path: '/forms/8495408/subscribers' },
  iha: { path: '/tags/26274007/subscribers' }
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

async function kit(path, body) {
  const res = await fetch(KIT + path, {
    method: 'POST',
    headers: {
      'X-Kit-Api-Key': process.env.C_API_SECRET,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kit ${path} ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json().catch(() => ({}));
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let data;
  try { data = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Bad request' }); }

  const email = String(data.email || '').trim().toLowerCase();
  const firstName = String(data.first_name || '').trim().slice(0, 80);
  const list = LISTS[data.list] ? data.list : 'newsletter';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'Invalid email' });

  try {
    // Create or update the subscriber, then add them to the right form or tag.
    const subscriber = { email_address: email };
    if (firstName) subscriber.first_name = firstName;
    await kit('/subscribers', subscriber);
    await kit(LISTS[list].path, { email_address: email });
    return json(200, { ok: true });
  } catch (err) {
    console.error(err.message);
    return json(502, { error: 'Subscribe failed' });
  }
};
