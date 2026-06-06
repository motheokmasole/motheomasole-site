exports.handler = async (event) => {
  const page = event.queryStringParameters?.page || 1;
  
  try {
    const res = await fetch(
      `https://api.kit.com/v4/broadcasts?page=${page}&per_page=9&status=published`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.C_API_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch posts' }) };
  }
};
