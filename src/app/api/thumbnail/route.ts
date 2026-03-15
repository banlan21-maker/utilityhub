export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');
  const quality = searchParams.get('quality');

  if (!videoId || !quality || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return new Response('Invalid params', { status: 400 });
  }

  const allowed = ['mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'];
  if (!allowed.includes(quality)) {
    return new Response('Invalid quality', { status: 400 });
  }

  const imageUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;

  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      return new Response('Image not found', { status: 404 });
    }

    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="thumbnail-${videoId}-${quality}.jpg"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('Failed to fetch image', { status: 500 });
  }
}
