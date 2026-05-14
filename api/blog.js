export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch('https://rss.blog.naver.com/ysungace');
    if (!response.ok) throw new Error('RSS fetch failed: ' + response.status);
    const xml = await response.text();

    // Parse XML without external dependencies
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const get = (tag) => {
        const m = itemXml.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
        return m ? m[1].trim() : '';
      };
      items.push({
        title: get('title'),
        link: get('link'),
        description: get('description').replace(/<[^>]+>/g, '').substring(0, 200),
        pubDate: get('pubDate'),
        author: get('author') || 'ysungace'
      });
    }

    // Also get channel info
    const channelTitle = (xml.match(/<channel>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '유성에이스 블로그';

    res.status(200).json({
      ok: true,
      channel: channelTitle.trim(),
      count: items.length,
      items
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
