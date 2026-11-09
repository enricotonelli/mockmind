import { linkedinConfig } from '@/lib/linkedinConfig';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (!userId || !token) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401 }
      );
    }

    // Parámetros de OAuth de LinkedIn
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: linkedinConfig.clientID,
      redirect_uri: linkedinConfig.callbackURL,
      scope: 'openid profile email',
      state: Buffer.from(JSON.stringify({ userId, token })).toString('base64')
    });

    const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    return new Response(JSON.stringify({ url: linkedinUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error en LinkedIn OAuth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
