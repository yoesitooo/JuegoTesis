# Documento de Requisitos del Producto (PRD) - EduRunner Math (Juego de Tesis)

## 1. Visión General del Producto
Juego educativo e interactivo ("EduRunner Math") orientado al aprendizaje y refuerzo de operaciones matemáticas básicas (suma, resta, multiplicación) para niños de primaria. La experiencia combina mecánicas de desplazamiento en carriles (runner) con selección intuitiva de respuestas (tocar para esquivar), retroalimentación inmediata, y una arquitectura Offline-First para entornos escolares sin conexión. Todo esto respaldado por un Dashboard estadístico y premium para educadores.

## 2. Arquitectura del Sistema (Monorepo)
El proyecto ha evolucionado a una estructura profesional de **Monorepo** para aislar lógicas, mejorar la seguridad y evitar cargas innecesarias de código.
*   **`/apps/game`**: La aplicación del juego dedicada 100% a la experiencia del estudiante.
*   **`/apps/dashboard`**: El panel de administración enfocado en los profesores.

## 3. Stack Tecnológico Implementado

### 3.1. Motor del Juego (apps/game)
*   **Phaser 3 (TypeScript):** Motor HTML5 ultraligero que renderiza en Canvas/WebGL. Configurado con `Phaser.Scale.RESIZE` para garantizar responsividad total en teléfonos, tablets y monitores.
*   **Vite + vite-plugin-pwa:** Infraestructura que convierte el juego en una Aplicación Web Progresiva (PWA). Permite almacenamiento en caché (Service Workers) garantizando que **el juego funcione al 100% sin internet**.
*   **Gestión de Datos Offline:** Persistencia de estado y puntajes en la memoria del navegador (`localStorage`) con sincronización (eventos `online`) para envío de métricas a base de datos.

### 3.2. Panel del Docente (apps/dashboard)
*   **React 18 + TypeScript + Vite:** SPA (Single Page Application) orientada a la velocidad y el análisis de datos.
*   **Tailwind CSS v4:** Framework de utilidades configurado bajo la nueva arquitectura v4 (`@tailwindcss/vite`), eliminando archivos de configuración heredados.
*   **Diseño Premium (UI/UX):** Implementación de Dark Mode y Glassmorphism (paneles translúcidos) para una experiencia sofisticada, junto con iconografía de `lucide-react`.

## 4. Características y Jugabilidad (Estudiantes)

### 4.1. Estética Visual y Activos (Assets)
*   **Diseño Doodle/Infantil:** Inspirado en ilustraciones vectoriales hechas a mano. Uso de colores pastel (fondo crema `#F9F7F1`) para emular un lienzo de papel.
*   **Gráficos SVG:** Todo el arte (vehículos, nubes de respuesta, árboles) está construido nativamente en SVG de alta calidad para evitar pixelación y tiempos de carga pesados.

### 4.2. Mecánicas de Juego Mejoradas
*   **Controles Ultra-Intuitivos (Touch-First):** Diseñado para motricidad infantil. Las opciones de respuesta (nubes) actúan como botones interactivos; al tocarlas, el avatar se dirige automáticamente hacia ese carril.
*   **Sistema de Progresión:** Estructurado en "Niveles" superables. Una barra de progreso visible se llena tras cada acierto (ej. alcanzar 5 puntos). Al ganar, se presenta una pantalla de "Nivel Superado" aumentando la velocidad y el reto.
*   **Dificultad Escalonada:**
    *   *Fácil:* Sumas de 1 dígito.
    *   *Medio:* Operaciones mixtas de suma y resta.
    *   *Difícil:* Introducción a las multiplicaciones.
*   **Animaciones y Retroalimentación Inmediata:**
    *   Inclinación deportiva dinámica (15 grados) en los cambios de carril.
    *   Efectos de celebración (saltos y destellos ✨) en respuestas correctas.
    *   Fogonazo rojo de pantalla completa y vibración de cámara (Camera Shake) en respuestas incorrectas o evadidas.

## 5. Requerimientos de Despliegue (Vercel)
Dada la arquitectura Monorepo, la plataforma requiere **dos despliegues independientes** sobre el mismo repositorio en la nube (Vercel). Para lograrlo, se configuran dos proyectos modificando el *Root Directory*:
1.  Proyecto 1 (`apps/game`): Expone la URL final para los estudiantes.
2.  Proyecto 2 (`apps/dashboard`): Expone la URL privada y administrativa para los educadores.