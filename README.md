# Bicicletería RideOn · TP integrador de Diseño Backend 2026

E-commerce de una bicicletería: catálogo con fotos y filtro por categoría, carrito,
registro/login con **Supabase Auth**, compra que controla el stock y calcula el total
**en el backend** (Express + Supabase) y front en JavaScript. Desplegado en **Vercel**.

**Integrantes:** Fran Sosa · Alejo Obreque
**Link del deploy:** _completar_

---

## Estructura

    tienda/
    ├── config/supabaseClient.js        la conexión a Supabase (clave secreta)
    ├── middlewares/verificarUsuario.js  ¿quién compra? (valida el token)
    ├── models/
    │   ├── productosModel.js           el catálogo
    │   ├── authModel.js                registro y login con Auth
    │   └── pedidosModel.js             la compra (stock + total)
    ├── controllers/                    validan y arman las respuestas
    ├── routes/tiendaRoutes.js          el mapa de rutas
    ├── utils/errores.js                errores con código
    ├── public/
    │   ├── index.html                  la página
    │   ├── estilos.css                 los colores de la tienda
    │   └── app.js                      el front con fetch
    ├── db/esquema.sql                  las tablas y los datos de ejemplo
    ├── index.js                        el servidor (local y Vercel)
    ├── .env.example                    modelo de credenciales
    └── package.json

## Puesta en marcha (en tu compu)

1. **Base.** Crear un proyecto en Supabase y correr `db/esquema.sql` en el
   **SQL Editor** (crea `categorias`, `productos`, `perfiles`, `pedidos` y `pedido_items`).
2. **Imágenes.** En **Storage**, crear un bucket público llamado `productos`,
   subir las fotos y guardar cada URL en `imagen_url`.
3. **Credenciales.** Copiar `.env.example` como `.env` y completar:

        SUPABASE_URL=https://<tu-proyecto>.supabase.co
        SUPABASE_KEY=<la Secret key de Project Settings → API Keys>

   La clave es **secreta**: nunca se sube al repositorio (`.gitignore` ya la excluye).
4. **Instalar y levantar:**

        npm install
        npm start

5. Abrir http://localhost:3000

## Las rutas

| Método | Ruta | Qué hace | Protegida |
|---|---|---|---|
| POST | `/registro` | crea el usuario en Supabase Auth y su perfil | no |
| POST | `/login` | devuelve el token (JWT) | no |
| GET | `/categorias` | lista las categorías | no |
| GET | `/productos` | lista los productos (`?categoria=2` filtra) | no |
| POST | `/pedidos` | registra la compra: controla el stock, calcula el total y descuenta | **sí** (token) |

## Cómo se usa

1. Entrás a la web y elegís una categoría (o **Todos**).
2. Agregás productos al carrito y ajustás las cantidades.
3. Te registrás (nombre, email y contraseña) e iniciás sesión.
4. Comprás: el backend valida el token, revisa el stock de cada producto, calcula
   el total con los precios de la base, guarda el pedido con sus items y descuenta
   el stock. Si no hay stock suficiente, la compra se rechaza con un 400 explicando
   cuánto hay disponible.
5. El front vacía el carrito y recarga el catálogo para mostrar el stock nuevo.

## Deploy en Vercel

1. El proyecto está en un repositorio de GitHub (el `.gitignore` deja afuera
   `node_modules`, `.env` y `.vercel`).
2. En Vercel: **Add New → Project**, elegir el repositorio. Vercel detecta Express solo.
3. En **Environment Variables** (Production y Preview) cargar:

        SUPABASE_URL=https://cfyhodnjmjpfbayrhkij.supabase.co
        SUPABASE_KEY=<la Secret key de Supabase>

4. **Deploy.** Vercel sirve la carpeta `public/` y ejecuta la API desde `index.js`.

## Decisiones técnicas

- **Dos clientes de Supabase** (`config/supabaseClient.js`): uno para las tablas y
  otro para el login. Van separados a propósito: al registrarse o loguearse, el
  cliente de Auth guarda la sesión y a partir de ahí sus consultas salen con el
  token del usuario en vez de la clave de servicio; con el token de usuario se
  activan las políticas de RLS de Supabase y se bloquean los INSERT de perfiles
  y de pedidos.
- **El total se calcula en el backend**, con los precios leídos de la base, nunca
  con los que manda el front.
- **El stock se descuenta en el backend** dentro de la compra, y se vuelve a leer
  en el catálogo para mostrar la cantidad real que queda.
- **La clave secreta nunca viaja al front**: el front solo habla con nuestra API
  mediante `fetch`.

## Mínimo obligatorio del TP

- [x] Catálogo con imágenes y filtro por categoría
- [x] Carrito
- [x] Registro y login
- [x] Compra que controla el stock y calcula el total en el backend
- [ ] Deploy en Vercel funcionando
- [ ] Este README actualizado con el link del deploy y los integrantes

## Extras para mejor nota

- Panel admin con rol (`perfiles.rol = 'admin'`, responde 403 a los clientes)
- Buscador por nombre
- "Mis pedidos"
- Página de detalle de producto

---

Prof. Julia Panei · UTN Neuquén · Diseño Backend 2026
