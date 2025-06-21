import { fetchAndStoreGazaTweets } from '../../../lib/twitter/twitter';

export async function GET(req: Request) {
  try {
    // Optionally, parse query params for force or mock
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    const useMock = searchParams.get('mock') === 'true';

    const tweets = await fetchAndStoreGazaTweets({ force, useMock });

    return new Response(
      JSON.stringify({
        success: true,
        count: tweets.length,
        tweets,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 's-maxage=900, stale-while-revalidate',
        },
      }
    );
  } catch (error) {
    let message = 'Failed to fetch Gaza/Palestine tweets';
    if (error && typeof error === 'object' && 'message' in error) {
      message = (error as any).message;
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}