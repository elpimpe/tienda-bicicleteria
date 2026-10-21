// MODEL DE USUARIOS: registro y login con Supabase Auth
const { supabase, auth } = require('../config/supabaseClient');
const { faltaImplementar } = require('../utils/errores');

// Registro: Auth crea el usuario y nosotros guardamos su perfil
async function registrar(email, password, nombre) {
  const { data, error } = await auth.auth.signUp({
    email,
    password
  });

  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error('No se pudo crear el usuario');

  // El perfil se guarda con el cliente de tablas (clave de servicio) para que
  // las politicas de RLS no bloqueen la insercion.
  const { error: perfilError } = await supabase
    .from('perfiles')
    .insert([{ id: user.id, nombre, rol: 'cliente' }]);

  if (perfilError) throw perfilError;

  return { id: user.id, email: user.email };
}

// Login: devuelve el token, o null si los datos no coinciden
async function iniciarSesion(email, password) {
  const { data, error } = await auth.auth.signInWithPassword({
    email,
    password
  });

  if (error) return null;
  if (!data.session) return null;

  return data.session.access_token;
}

module.exports = { registrar, iniciarSesion };
