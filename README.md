# GTools Lab — Corporate Website

## Estructura del Proyecto

```
gtoolslab/
├── index.html          ← Página principal (toda la web en un archivo)
├── css/
│   └── styles.css      ← Estilos completos con variables CSS
├── js/
│   └── main.js         ← JavaScript: animaciones, contadores, formulario
├── assets/             ← Carpeta para imágenes y recursos
│   └── (og-image.jpg)  ← Agregar imagen para Open Graph (1200×630px)
└── README.md           ← Este archivo
```

## Personalización Rápida

### Cambiar números de estadísticas
En `index.html`, sección `#stats`, modifica el atributo `data-target`:
```html
<div class="stat-number" data-target="50" data-suffix="+">50+</div>
<!-- Cambia 50 por el número que desees -->
```

### Cambiar colores
En `css/styles.css`, modifica las variables al inicio:
```css
:root {
  --color-blue:  #2563EB;   /* Azul principal */
  --color-cyan:  #06B6D4;   /* Acento cian   */
}
```

### Cambiar datos de contacto
Buscar y reemplazar en `index.html`:
- `contacto@gtoolslab.com` → tu correo
- `+54 9 XXX XXX XXXX`    → tu número
- `5490000000000`          → número para WhatsApp (sin espacios ni +)

### Agregar imagen de Open Graph
Guardar una imagen de 1200×630px como `assets/og-image.jpg` y
actualizar la URL en las meta tags de `index.html`.

## Tecnologías Usadas
- HTML5 semántico
- CSS3 (variables, grid, flexbox, animations)
- Vanilla JavaScript (ES6+, Intersection Observer)
- Google Fonts: Syne + DM Sans

## Producción
El sitio no tiene dependencias externas de npm/build.
Para deploy: subir los 3 archivos/carpetas a cualquier hosting estático.
