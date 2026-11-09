import { linkedinConfig, mapearPerfilLinkedIn } from '@/lib/linkedinConfig';
import prisma from '@/lib/prisma';

export const maxDuration = 30;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return new Response(
        `Error de LinkedIn: ${error}`,
        { status: 400 }
      );
    }

    if (!code || !state) {
      return new Response('Parámetros faltantes', { status: 400 });
    }

    // Decodificar state para obtener userId y token
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      return new Response('State inválido', { status: 400 });
    }

    // Intercambiar código por access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: linkedinConfig.clientID,
        client_secret: linkedinConfig.clientSecret,
        redirect_uri: linkedinConfig.callbackURL
      }).toString()
    });

    if (!tokenResponse.ok) {
      throw new Error(`LinkedIn token error: ${tokenResponse.statusText}`);
    }

    const { access_token } = await tokenResponse.json();

    // Obtener perfil de LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) {
      throw new Error(`LinkedIn profile error: ${profileResponse.statusText}`);
    }

    const linkedinProfile = await profileResponse.json();

    // Obtener email
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=primary&projection=(elements*(handle~))', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    let email = null;
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      email = emailData.elements?.[0]?.['handle~']?.emailAddress;
    }

    // Guardar linkedinId en usuario
    if (stateData.userId) {
      await prisma.usuario.update({
        where: { id: stateData.userId },
        data: {
          linkedinId: linkedinProfile.id,
          linkedinAccessToken: access_token
        }
      });
    }

    // Redirigir a frontend con datos
    const datosEncoded = Buffer.from(JSON.stringify({
      nombre: linkedinProfile.localizedFirstName + ' ' + linkedinProfile.localizedLastName,
      email,
      linkedinId: linkedinProfile.id,
      foto: linkedinProfile.profilePicture?.displayImage
    })).toString('base64');

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/perfil?linkedin=${datosEncoded}`
      }
    });
  } catch (error) {
    console.error('Error en LinkedIn callback:', error);
    return new Response(
      `Error: ${error.message}`,
      { status: 500 }
    );
  }
}
