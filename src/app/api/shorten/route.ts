export async function POST(req: Request) {
  let url: string;
  try {
    ({ url } = await req.json());
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!url || !url.match(/^https?:\/\/.+/)) {
    return Response.json({ error: 'Invalid URL. Must start with http:// or https://' }, { status: 400 });
  }

  try {
    const apiUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'UtilityHub/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    const text = (await res.text()).trim();

    if (!text.startsWith('https://is.gd/') && !text.startsWith('https://v.gd/')) {
      return Response.json({ error: text || 'Service error' }, { status: 502 });
    }

    return Response.json({ short: text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
