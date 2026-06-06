exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };

  try {
    const res = await fetch(
      `https://api.kit.com/v4/broadcasts/${id}`,
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
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch post' }) };
  }
};
