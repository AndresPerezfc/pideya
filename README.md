# PideYa

Pide en la cafetería El Tintico desde el celular y recoge cuando esté listo, sin hacer fila.

Proyecto de Innova Devs para el taller **Desarrollo web con IA**.

## Arrancar

En la terminal de VS Code (PowerShell), dentro de esta carpeta:

```powershell
npm install
copy .env.example .env
npm start
```

Abre http://localhost:3000. El servidor se reinicia solo cuando cambian `server.js`, `api/` o `db/` (por ejemplo, después de un `git pull`). Para detenerlo: `Ctrl + C` en la terminal.

| Página | Para qué |
|---|---|
| http://localhost:3000 | La app del estudiante |
| http://localhost:3000/cocina/ | El tablero de la cocina |
| http://localhost:3000/probador.html | Probar la API sin frontend |

## El proyecto como un restaurante

Se construye por relevos: cada equipo recibe lo que dejó el anterior.

| Relevo | Equipo | En el restaurante | Archivos |
|---|---|---|---|
| 1 | Frontend | El mesero y el menú: lo que el cliente ve y toca | `public/` |
| 2 | Datos | La despensa y el cuaderno de inventario | `db/` |
| 3 | Backend | La cocina: recibe la comanda y aplica las reglas | `api/pedidos.js` |
| 4 | Seguridad | Las cerraduras: probar si se pueden forzar | Donde haga falta |

`contrato.md` es la comanda: cómo se piden las cosas entre el mesero y la cocina. `CLAUDE.md` son las reglas de la casa que sigue la IA.

## Pruebas

```powershell
npm test
```

GitHub las corre solo en cada Pull Request.
