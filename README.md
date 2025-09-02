# MATEA - Landing Page

Una landing page elegante y moderna para MATEA, el bolso de mate reinventado. Desarrollada con Angular 19 y Bootstrap 5.

## 🚀 Características

- **Diseño Responsivo**: Se adapta perfectamente a todos los dispositivos
- **Tipografía Elegante**: Utiliza Playfair Display para títulos y Open Sans para texto
- **Paleta de Colores**: Colores sofisticados (#F7F4EE y #3F4C3C)
- **Formulario Funcional**: Lista de espera integrada
- **Imágenes Optimizadas**: Carrusel de productos y galería
- **Animaciones Suaves**: Efectos visuales atractivos

## 🛠️ Tecnologías Utilizadas

- **Angular 19**: Framework principal
- **Bootstrap 5**: Sistema de grid y componentes
- **SCSS**: Preprocesador de CSS
- **TypeScript**: Lenguaje de programación

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── app.component.html      # Template principal
│   ├── app.component.scss      # Estilos específicos
│   ├── app.component.ts        # Lógica del componente
│   ├── app.config.ts           # Configuración de la app
│   └── app.routes.ts           # Rutas de la aplicación
├── assets/
│   ├── carrusel/               # Imágenes del carrusel
│   │   ├── imagen-1.png
│   │   ├── imagen-2.png
│   │   └── imagen-3.png
│   ├── logos/                  # Logo de la marca
│   │   └── M-single.png
│   └── principales/            # Imágenes principales
│       ├── imagen-grande.png
│       └── principal.png
├── styles.scss                 # Estilos globales
└── main.ts                     # Punto de entrada
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- Angular CLI

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd mateabags
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Instalar Bootstrap y Popper.js**
   ```bash
   npm install bootstrap @popperjs/core
   ```

4. **Ejecutar la aplicación**
   ```bash
   ng serve
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:4200
   ```

## 🎨 Personalización

### Colores

Los colores principales están definidos como variables CSS en `src/styles.scss`:

```scss
:root {
  --color-primary: #F7F4EE;      // Color principal (beige claro)
  --color-secondary: #3F4C3C;    // Color secundario (verde oscuro)
  --color-text-dark: #3F4C3C;    // Texto oscuro
  --color-text-light: #ffffff;    // Texto claro
  --color-accent: #8B9A8B;       // Color de acento
  --color-border: #E5E0D8;       // Color de bordes
}
```

### Tipografías

- **Títulos**: Playfair Display (serif)
- **Texto**: Open Sans (sans-serif)

### Imágenes

Para cambiar las imágenes, simplemente reemplaza los archivos en las carpetas correspondientes:

- **Logo**: `assets/logos/M-single.png`
- **Imagen Hero**: `assets/principales/imagen-grande.png`
- **Imagen Principal**: `assets/principales/principal.png`
- **Carrusel**: `assets/carrusel/imagen-1.png`, `imagen-2.png`, `imagen-3.png`

## 📱 Responsive Design

La landing page está optimizada para:

- **Desktop**: 1200px y superior
- **Tablet**: 768px - 1199px
- **Mobile**: 576px - 767px
- **Small Mobile**: Menos de 576px

## 🔧 Funcionalidades

### Formulario de Lista de Espera

- Validación de campos requeridos
- Almacenamiento temporal de datos
- Mensaje de confirmación
- Limpieza automática del formulario

### Navegación

- Header fijo con logo
- Scroll suave entre secciones
- Enlaces internos funcionales

### Animaciones

- Efectos hover en tarjetas
- Animaciones de entrada
- Transiciones suaves
- Efectos de sombra

## 🚀 Despliegue

### Build de Producción

```bash
ng build --configuration production
```

### Despliegue en Firebase

```bash
ng build --configuration production
firebase deploy
```

### Despliegue en Netlify

```bash
ng build --configuration production
# Subir la carpeta dist/mateabags/browser a Netlify
```

## 📝 Secciones de la Landing Page

1. **Header**: Logo MATEA fijo en la parte superior
2. **Hero Section**: Título principal y imagen destacada
3. **Tagline**: Mensaje "Todo en su lugar. Siempre listo."
4. **Features**: Tres características principales del producto
5. **Main Product**: Imagen principal del bolso
6. **Product Gallery**: Carrusel de tres imágenes
7. **Call to Action**: Botón de llamada a la acción
8. **Waitlist Form**: Formulario de lista de espera
9. **Footer**: Información de copyright

## 🎯 Optimizaciones

- **Performance**: Lazy loading de imágenes
- **SEO**: Meta tags optimizados
- **Accessibility**: ARIA labels y navegación por teclado
- **Cross-browser**: Compatibilidad con navegadores modernos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**MATEA** - El bolso de mate reinventado 🧉✨
