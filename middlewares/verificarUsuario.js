// MIDDLEWARE: ¿quién compra?
// Va entre la ruta y el controller. Si no hay token valido, corta con 401.
// Si todo esta bien, deja el usuario en req.usuario y sigue.
const { auth } = require('../config/supabaseClient');

async function verificarUsuario(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Falta el token');
    }

    const token = authHeader.substring(7);
    const { data, error } = await auth.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).send('Token inválido');
    }

    req.usuario = { id: data.user.id, email: data.user.email };
    next();
  } catch (error) {
    return res.status(401).send('Token inválido');
  }
}

module.exports = verificarUsuario;
