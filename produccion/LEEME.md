# Producción en el PC 5

El PC 5 es la "sala de servidores" de Innova Devs: corre la versión oficial de PideYa (la rama `main`) y la publica en internet. Nadie edita código en este computador.

## Una sola vez

1. Clona el repositorio en una carpeta solo para producción, por ejemplo `C:\produccion\pideya`.
2. Crea el `.env` (deja la clave de la cocina como viene: el tablero de cocina la usa):
   ```powershell
   copy .env.example .env
   ```
3. Solo si vas a usar el túnel, instala cloudflared: `winget install --id Cloudflare.cloudflared`

## El día del taller

Si los celulares del salón pueden abrir `http://<IP de este computador>:3000` (la IP sale con `ipconfig`), basta la ventana 1 y esa es la dirección de producción. Si la red no lo permite, usa también la ventana 2 (el túnel).

Ventanas de PowerShell, dentro de la carpeta de producción:

**Ventana 1: la app.** Vigila `main` y redespliega en unos 20 segundos después de cada merge.

```powershell
powershell -ExecutionPolicy Bypass -File .\produccion\iniciar.ps1
```

**Ventana 2 (solo si la red local no funciona): el túnel.** Da una dirección pública para los celulares.

```powershell
powershell -ExecutionPolicy Bypass -File .\produccion\tunel.ps1
```

Copia la dirección de producción (la local `http://<IP>:3000` o la del túnel `https://....trycloudflare.com`) en la consola del taller: Facilitador → Producción de PideYa. Con eso aparecen el QR y el monitor.

## Si algo falla

- **No hagas clic ni selecciones texto en la ventana 1.** En la consola de Windows eso pausa la app y producción deja de responder sin mostrar error. Si pasa: Esc o Enter; si no se destraba, Ctrl + C y vuelve a correr `iniciar.ps1`. Para evitarlo: clic derecho en la barra de título → Propiedades → desmarca "Modo de edición rápida".
- **"Producción caída" en rojo:** el último merge rompió algo. Se arregla con un Pull Request que lo corrija o lo revierta (`git revert`), no tocando este computador.
- **Se cerró el túnel:** vuelve a abrirlo. La dirección cambia: pégala otra vez en la consola.
- **Los datos de los pedidos** viven en `data/pideya.db` de este computador y sobreviven a los redespliegues. El inventario se recarga desde `db/seed.sql` cada vez que la app se reinicia.
