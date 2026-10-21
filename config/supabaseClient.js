// CONEXION A SUPABASE
// Se usa la clave SECRETA: solo vive en el servidor, nunca en el front.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const opciones = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
};

// Cliente de las TABLAS. Nunca inicia sesión, así que cada consulta sale con
// la clave de servicio y por lo tanto salta las políticas de RLS de Supabase.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  opciones
);

// Cliente de AUTH (registro, login y validación del token). Se mantiene
// APARTE a propósito: cuando alguien se registra o loguea, este cliente guarda
// la sesión del usuario y desde ese momento sus consultas salen con el token
// de ESE usuario en vez de la clave de servicio. Con el token de usuario las
// políticas de RLS se activan y bloquean los INSERT de perfiles y de pedidos.
const auth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  opciones
);

module.exports = { supabase, auth };
