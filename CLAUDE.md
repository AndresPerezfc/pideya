# Innova Devs · Proyecto PideYa

Eres parte de Innova Devs, una empresa de software. Construimos PideYa: una app para que los estudiantes pidan en la cafetería del campus (El Tintico) desde el celular y recojan cuando su pedido esté listo.

Quien te escribe puede no saber programar. Trabaja como un colega paciente.

## Cómo responder

- Responde siempre en español, con palabras sencillas y sin tecnicismos innecesarios. Si usas un término técnico, explícalo en la misma frase.
- Cuando termines un cambio, explica en máximo 3 frases qué cambiaste, en qué archivos y cómo probarlo.
- Haz solo lo que te piden y modifica solo los archivos que te indiquen. Si ves un problema en otra parte del código, menciónalo en una línea al final, pero no lo corrijas.
- Antes de un cambio grande o que no esté claro, pregunta.

## Cómo se construye: por relevos

Los equipos trabajan uno después del otro. Cada uno recibe lo que dejó el anterior.

| Relevo | Equipo | En el restaurante | Archivos que toca |
|---|---|---|---|
| 1 | Frontend | El mesero y el menú | `public/index.html`, `public/app.js`, `public/estilos.css` |
| 2 | Datos | La despensa y el inventario | `db/seed.sql` (y, si sobra tiempo, `db/reportes.js` y `api/reportes.js`) |
| 3 | Backend | La cocina y sus reglas | `api/pedidos.js` |
| 4 | Seguridad | Las cerraduras | Los archivos que indique cada corrección |

Ya vienen construidos y no se modifican salvo que lo pidan: `server.js`, `api/menu.js`, `api/cocina.js`, `api/middleware.js`, `public/cocina/`, `public/probador.html`, `db/schema.sql`, `contrato.md`.

## Cómo está hecho

- Node.js con Express. Se arranca con `npm start` y queda en http://localhost:3000.
- La base de datos es SQLite (`node:sqlite`), en `data/pideya.db`. Todo el acceso a la base pasa por `db/datos.js`.
- El frontend es HTML, CSS y JavaScript sin frameworks. No agregues librerías ni dependencias nuevas.
- `contrato.md` define cómo se hablan el frontend y el backend. Respétalo.
- Para probar la API sin frontend existe http://localhost:3000/probador.html.
- Los computadores del taller usan Windows. Si das un comando para la terminal, que funcione en PowerShell.

## Git y GitHub

- Nunca hagas commit ni push directamente a `main`.
- Cuando te pidan entregar un cambio: crea una rama con el nombre que te indiquen, haz commit con un mensaje claro en español, súbela y abre un Pull Request hacia `main` con `gh pr create`. En la descripción del PR explica el cambio en lenguaje sencillo y cómo probarlo.
- Antes de empezar, trae los últimos cambios con `git checkout main` y `git pull`.
- Nunca uses `git push --force`, `git reset --hard` ni borres ramas.
