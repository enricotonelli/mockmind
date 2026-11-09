/**
 * Configuración de LinkedIn OAuth
 */

export const linkedinConfig = {
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production'
    ? 'https://mockmind-nine.vercel.app/api/auth/linkedin/callback'
    : 'http://localhost:3000/api/auth/linkedin/callback',
  scope: [
    'r_liteprofile',
    'r_emailaddress',
    'r_basicprofile'
  ]
};

/**
 * Mapea datos de LinkedIn al modelo de usuario
 */
export function mapearPerfilLinkedIn(profile) {
  const email = profile.emails?.[0]?.value || null;
  const nombre = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
  const foto = profile.photos?.[0]?.value || null;
  const resumen = profile.bio || null;

  // Experiencia laboral
  const experiencia = profile.positions?.values?.slice(0, 3).map(pos => ({
    titulo: pos.title,
    empresa: pos.company?.name,
    fechaInicio: pos.startDate,
    fechaFin: pos.endDate,
    descripcion: pos.summary
  })) || [];

  // Educación
  const educacion = profile.educations?.values?.map(edu => ({
    escuela: edu.schoolName,
    carrera: edu.fieldOfStudy,
    grado: edu.degree,
    fechaFin: edu.endDate
  })) || [];

  return {
    email,
    nombre,
    foto,
    resumen,
    experiencia,
    educacion,
    linkedinId: profile.id,
    linkedinUrl: profile.profileUrl
  };
}
