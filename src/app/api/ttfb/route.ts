import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Basic URL validation
  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  try {
    const start = Date.now();
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      // Only get headers (first byte), don't download full body
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'UtilityHub-TTFB-Tester/1.0',
      },
    });

    const ttfb = Date.now() - start;

    // Consume and discard the body to avoid memory leak
    await response.body?.cancel();

    return NextResponse.json({
      ttfb,
      status: response.status,
      ok: response.ok,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = message.includes('timeout') || message.includes('abort');
    return NextResponse.json(
      { error: isTimeout ? 'Request timed out (10s)' : `Connection failed: ${message}` },
      { status: 502 }
    );
  }
}
