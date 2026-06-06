const CK_API_SECRET = process.env.CK_API_SECRET;
const CK_API_BASE = 'https://api.convertkit.com/v3';

exports.handler = async (event) => {
  const page = event.queryStringParameters?.page || 1;
  const limit = event.queryStringParameters?.limit || 9;

  try {
    const res = await fetch(
      `${CK_API_BASE}/broadcasts?api_secret=${CK_API_SECRET}&page=${page}&per_page=${limit}`
    );
    const data = await res.json();

    // Filter to only published broadcasts
    const published = (data.broadcasts || []).filter(b => b.published_at);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // cache 5 mins
      },
      body: JSON.stringify({
        broadcasts: published,
        total_count: data.total_count,
        total_pages: data.total_pages,
        page: data.page
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch posts' })
    };
  }
};
