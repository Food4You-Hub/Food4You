# 🍽️ Food4You · Breathe Taste Innovate
### Tienda Web con GitHub Pages & Automatización en Google Apps Script

Este repositorio contiene la tienda web de **Food4You**, optimizada para publicarse en **GitHub Pages** y conectada con un backend en **Google Apps Script**.

---

## 🚀 ¿Cómo funciona la automatización?

1. **Compra en la Web**: El cliente añade productos al carrito, rellena sus datos de facturación en el checkout y pulsa **"Pagar Factura y Emitir Documentos"**.
2. **Generación de Documentación**: La web genera en memoria el libro Excel completo con diseño corporativo (contiene 3 hojas: **Pedido**, **Albarán** y **Factura** con fórmulas e impuestos calculados).
3. **Conexión con Google Apps Script**: La web envía el archivo Excel en Base64 junto a los datos del cliente al Web App de Google Apps Script.
4. **Almacenamiento en Google Drive**: Google Apps Script busca o crea automáticamente la carpeta **`Ventas por Web`** en tu unidad de Google Drive y guarda allí el archivo `.xlsx`.
5. **Envío del Correo al Cliente**: Desde tu dirección de correo de Gmail, se envía automáticamente un email corporativo con diseño HTML y el archivo Excel adjunto al cliente.

---

## 📋 Paso 1: Configurar el Backend en Google Apps Script

1. Entra en tu navegador a [script.google.com](https://script.google.com/) con tu cuenta de Google.
2. Haz clic en **"Nuevo proyecto"** (New project).
3. Asigna un nombre al proyecto en la esquina superior izquierda (por ejemplo, `Food4You Backend`).
4. Borra el código que aparece por defecto en el archivo `Código.gs` (o `Code.gs`).
5. Abre el archivo [`google-apps-script/Codigo.js`](./google-apps-script/Codigo.js) de este repositorio, **copia todo su contenido y pégalo** en el editor de Apps Script.
6. Pulsa el icono de **Guardar** (Ctrl+S / 💾).

### Probar el script (Opcional pero muy recomendado):
- En el desplegable de funciones de la barra superior, selecciona **`testEnvio`** y pulsa **Ejecutar** (Run).
- Google te solicitará permisos la primera vez:
  - Haz clic en *Revisar permisos* -> Elige tu cuenta -> Pulsa *Configuración avanzada* -> Haz clic en *Ir a Food4You Backend (no seguro)* -> Pulsa *Permitir*.
- Tras ejecutarse, revisa tu Google Drive: verás que se ha creado la carpeta **"Ventas por Web"** con un archivo de prueba, y habrás recibido un correo en tu bandeja de entrada.

### Desplegar como Aplicación Web:
1. En la esquina superior derecha, haz clic en el botón azul **"Implementar"** (Deploy) > **"Nueva implementación"** (New deployment).
2. En el icono de engranaje (⚙️), selecciona el tipo **"Aplicación web"** (Web app).
3. Rellena los siguientes campos:
   - **Descripción**: `V1 - Ventas Food4You`
   - **Ejecutar como**: **Yo (tu cuenta de correo)**
   - **Quién tiene acceso**: **Cualquiera** (*Anyone*) ⚠️ *(Es fundamental seleccionar "Cualquiera" para que los clientes de la web puedan enviar el pedido sin necesidad de iniciar sesión en Google)*.
4. Haz clic en **"Implementar"** (Deploy).
5. **Copia la "URL de la aplicación web"** generada (tiene un formato como `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Paso 2: Vincular la URL en tu página web

1. Abre el archivo [`index.html`](./index.html) en tu editor.
2. Cerca de la línea 332, localiza la constante `GOOGLE_SCRIPT_URL`:
   ```javascript
   const GOOGLE_SCRIPT_URL = "TU_URL_DE_APPS_SCRIPT_AQUI";
   ```
3. Sustituye `"TU_URL_DE_APPS_SCRIPT_AQUI"` por la URL que copiaste en el paso anterior:
   ```javascript
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TU_CODIGO_AQUI/exec";
   ```
4. Guarda los cambios.

---

## 🌐 Paso 3: Publicar la Web en GitHub Pages

Para publicar tu tienda en GitHub Pages y que sea accesible públicamente en internet:

1. Crea un repositorio nuevo en [GitHub](https://github.com/new) (por ejemplo, `food4you-store`). Puedes marcarlo como Público.
2. Abre la terminal en la carpeta de este proyecto y ejecuta los siguientes comandos:

```bash
# Inicializar repositorio git local
git init

# Añadir todos los archivos
git add .

# Crear el primer commit
git commit -m "Publicación inicial de la tienda Food4You con automatización Apps Script"

# Renombrar rama principal a main
git branch -M main

# Conectar con tu repositorio remoto de GitHub (sustituye TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/food4you-store.git

# Subir los archivos a GitHub
git push -u origin main
```

3. **Activar GitHub Pages**:
   - En tu repositorio de GitHub, ve a la pestaña **Settings** (Configuración) > **Pages** (en el menú lateral izquierdo).
   - En **Build and deployment > Source**, selecciona **Deploy from a branch**.
   - En **Branch**, selecciona **`main`** y la carpeta **`/ (root)`**, luego pulsa **Save**.
   - En unos minutos, GitHub te proporcionará la URL pública de tu web (por ejemplo, `https://TU_USUARIO.github.io/food4you-store/`).

---

## 📁 Estructura del Proyecto

```
food4you-store/
├── index.html                  # Aplicación web completa con catálogo, carrito, ExcelJS y checkout
├── .nojekyll                   # Evita que Jekyll procese los archivos estáticos en GitHub Pages
├── README.md                   # Esta guía de configuración y despliegue
└── google-apps-script/
    └── Codigo.js               # Código del backend en Google Apps Script (Drive y Gmail)
```

---

## 💡 Verificación de Funcionamiento

- Haz una compra de prueba en la web introduciendo tu correo electrónico personal.
- Comprueba que:
  1. En tu Google Drive se almacena automáticamente el archivo en la carpeta **"Ventas por Web"**.
  2. En la bandeja de entrada del correo especificado en la compra recibes el correo corporativo con el Excel adjunto.
  3. En la pantalla final de la web se puede descargar el Excel en cualquier momento pulsando el botón **"Descargar"**.
