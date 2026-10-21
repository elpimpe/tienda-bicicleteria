-- =========================================================
-- BASE DE LA TIENDA
-- Pegalo en el SQL Editor de Supabase y apreta Run.
-- Despues cambia las categorias y los productos por los de tu rubro.
-- =========================================================

-- ===== TABLAS =====
create table categorias (
  id     bigint generated always as identity primary key,
  nombre text not null unique
);

create table productos (
  id           bigint generated always as identity primary key,
  nombre       text not null,
  descripcion  text,
  precio       numeric(10,2) not null check (precio >= 0),
  stock        int not null default 0 check (stock >= 0),
  imagen_url   text,
  categoria_id bigint references categorias(id),
  activo       boolean not null default true
);

-- Los usuarios los maneja Supabase Auth (auth.users).
-- Aca guardamos lo que Auth no guarda: el nombre y el rol.
create table perfiles (
  id     uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol    text not null default 'cliente' check (rol in ('cliente', 'admin'))
);

create table pedidos (
  id         bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id),
  total      numeric(10,2) not null check (total >= 0),
  estado     text not null default 'pendiente'
             check (estado in ('pendiente', 'confirmado', 'cancelado')),
  creado     timestamptz not null default now()
);

create table pedido_items (
  id              bigint generated always as identity primary key,
  pedido_id       bigint not null references pedidos(id) on delete cascade,
  producto_id     bigint not null references productos(id),
  cantidad        int not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null check (precio_unitario >= 0)  -- la foto del precio
);

-- ===== SEGURIDAD: cerramos las tablas al publico =====
-- Con la clave publica no se puede leer ni escribir nada.
-- Nuestro backend entra igual porque usa la clave secreta.
alter table categorias   enable row level security;
alter table productos    enable row level security;
alter table perfiles     enable row level security;
alter table pedidos      enable row level security;
alter table pedido_items enable row level security;

-- ===== DATOS DE EJEMPLO (cambialos por los de tu rubro) =====
insert into categorias (nombre) values ('Bicicletas'), ('Accesorios'), ('Repuestos');

insert into productos (nombre, descripcion, precio, stock, categoria_id) values
  ('Bicicleta MTB 27.5"', 'Marco de aluminio, 21 velocidades', 150000, 5, 1),
  ('Bicicleta Urbana 28"', 'Ideal para ciudad, liviana', 95000, 8, 1),
  ('Bicicleta Ruta 700C', 'Monoplato, cuadro carbono', 380000, 3, 1),
  ('Casco de Bicicleta', 'Certificación CE, regulable', 25000, 25, 2),
  ('Luces LED', 'Recargables, impermeables', 12000, 40, 2),
  ('Candado U-Lock', 'Alta seguridad', 18000, 35, 2),
  ('Neumático 27.5"', 'Antipinchazos', 8500, 60, 3),
  ('Cadena de Bicicleta', '9 velocidades, resistente', 6500, 80, 3),
  ('Pastillas de Freno', 'Juego x 2', 4500, 120, 3);

-- ===== IMAGENES =====
-- Subi las fotos al bucket publico "productos" de Storage y guarda cada URL:
-- update productos
-- set imagen_url = 'https://xxxx.supabase.co/storage/v1/object/public/productos/auriculares.jpg'
-- where id = 1;
