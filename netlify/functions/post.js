const CK_API_SECRET = process.env.CK_API_SECRET || 'kit_ed9a693286ebf99bd1e93d5e6b4f7256';
const CK_API_BASE = 'https://api.convertkit.com/v3';

exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };

  try {
    const res = await fetch(`${CK_API_BASE}/broadcasts/${id}?api_secret=${CK_API_SECRET}`);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch post' }) };
  }
};
