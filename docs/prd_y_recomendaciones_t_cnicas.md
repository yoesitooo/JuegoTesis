# Documento de Requisitos del Producto (PRD) - Juego de Matemáticas Runner

## 1. Visión General del Producto
Juego educativo e interactivo orientado al aprendizaje y refuerzo de operaciones matemáticas básicas (suma, resta, multiplicación y división) para niños. La experiencia combina mecánicas de desplazamiento en carriles ("runner" o carrera infinita) con selección de respuestas, retroalimentación inmediata y un panel de métricas de desempeño para educadores.

## 2. Usuarios Objetivo
* **Estudiantes (Niños):** Usuarios primarios que interactúan con el juego a través de avatares personalizables y desafíos gamificados.
* **Docentes / Educadores:** Usuarios secundarios que supervisan el progreso, analizan estadísticas y diseñan retroalimentaciones pedagógicas a partir de los datos.

## 3. Características y Requerimientos Funcionales

### 3.1. Jugabilidad y Mecánicas
* **Escenario de juego:** El personaje se desplaza sobre una carretera, pista o vía dividida en múltiples carriles.
* **Presentación de operaciones:** El sistema muestra una operación matemática en la parte superior o central de la pantalla (ej. $5 + 5$).
* **Selección de respuesta:** Cada carril presenta un obstáculo, puerta o cartel con una opción de respuesta. El jugador debe maniobrar su personaje hacia el carril con el resultado correcto.
* **Dificultad progresiva:** Sistema escalonado por niveles, desde operaciones básicas (un dígito) hasta desafíos más complejos, fomentando la práctica repetitiva.

### 3.2. Personalización de Personajes
* **Avatares seleccionables:** Selección de animales del entorno (caballos, vacas, perros) o vehículos (carritos).
* **Personalización cosmética:** Opciones para modificar colores, sombreros o accesorios del personaje elegido para generar apego y motivación.

### 3.3. Progreso y Retroalimentación
* **Barra de progreso:** Indicador visual (UI) del avance en el nivel o la sesión activa.
* **Feedback inmediato:** Efectos visuales y sonoros instantáneos al acertar (celebración) o fallar (animación de error/tropiezo) durante la partida.
* **Módulo de estadísticas (Dashboard del Docente):**
  * Registro de intentos, aciertos y errores (ej. "Juanito: 8 aciertos de 10 intentos en Sumas Nivel 1").
  * Análisis de frecuencia de uso.
  * Panel web accesible para el docente que facilite el seguimiento pedagógico.

## 4. Requerimientos Técnicos y de Conectividad
* **Arquitectura Offline-First:** El juego debe permitir el acceso y la jugabilidad completa sin conexión a internet (modo asíncrono).
* **Almacenamiento Local:** Guardado de progreso, monedas/puntos y estadísticas temporalmente en el dispositivo.
* **Sincronización Automática:** Carga transparente de las métricas al servidor una vez el dispositivo detecte conexión a internet (modo síncrono).

---

# Recomendaciones de Stack Tecnológico

Para cumplir con los requisitos (especialmente el manejo offline/online y mecánicas runner), aquí tienes las mejores opciones de lenguajes y herramientas:

### 1. Motor de Videojuegos (Frontend)
* **Opción A: Godot Engine (GDScript / C#)**
  * *Por qué:* Es de código abierto, extremadamente ligero y excelente tanto para 2D como para 3D. Exporta fácilmente a Web (HTML5), Android, iOS y PC. 
* **Opción B: Unity (C#)**
  * *Por qué:* Es el estándar de la industria. Tiene miles de tutoriales para hacer juegos tipo "Endless Runner" y recursos listos para usar.
* **Opción C: Phaser.js (JavaScript / TypeScript)**
  * *Por qué:* Si el proyecto está pensado puramente como una aplicación web (PWA). Al ser web, es muy fácil integrar Service Workers para que el juego funcione sin conexión en cualquier navegador.

### 2. Base de Datos y Backend (Sincronización Offline/Online)
* **Firebase (Firestore) o Supabase**
  * *Por qué es obligatorio para este proyecto:* Firebase tiene soporte nativo para **persistencia de datos offline**. Si el niño juega sin internet, Firebase guarda los resultados (aciertos, errores) en la caché local del dispositivo. Cuando el niño se conecta al Wi-Fi, Firebase sincroniza automáticamente los datos con la nube sin que tengas que programar esa lógica desde cero.

### 3. Dashboard del Docente (Panel Web)
* **React.js o Vue.js (JavaScript / TypeScript)**
  * *Por qué:* Ideal para consumir la base de datos de Firebase/Supabase y mostrar tablas y gráficas (usando librerías como *Chart.js* o *Recharts*) con el rendimiento de los alumnos.

---

# Recursos Visuales y Auditivos (Assets Descargables)

Para no empezar desde cero con el arte y la música, puedes utilizar las siguientes plataformas que ofrecen recursos gratuitos (Licencia CC0 - Dominio Público) de altísima calidad:

### 1. Gráficos (Personajes, Carros, Animales y Escenarios)
* **Kenney.nl (¡El mejor para empezar!)**
  * *Animales:* Busca el pack "Animal Pack" (tiene modelos 3D y 2D de vacas, perros, caballos, etc.).
  * *Carritos:* Busca "Racing Pack" o "Micro Roguelike".
  * *UI (Interfaz):* "UI Pack" (botones, barras de progreso, iconos de matemáticas).
  * *Sitio:* [kenney.nl/assets](https://kenney.nl/assets) (Todo es 100% gratis).
* **Itch.io**
  * Filtra por "Free" y "2D/3D Assets". Hay miles de artistas subiendo spritesheets (animaciones de correr, saltar) de animales y entornos escolares.
  * *Sitio:* [itch.io/game-assets/free](https://itch.io/game-assets/free)
* **CraftPix.net**
  * Ofrece paquetes de fondos con desplazamiento infinito (parallax backgrounds) ideales para juegos tipo runner. Tienen sección gratuita.

### 2. Audio (Música y Efectos de Sonido)
* **Freesound.org**
  * Perfecto para efectos de sonido cortos: "ding" (respuesta correcta), "buzzer" o tropezón (respuesta incorrecta), sonidos de recolección de monedas, ladridos o mugidos.
* **Incompetech (Kevin MacLeod)**
  * La biblioteca por excelencia de música de fondo sin copyright. Ideal para pistas alegres e infantiles que mantengan el ritmo del juego.
  * *Sitio:* [incompetech.com](https://incompetech.com/)
* **Kenney Audio**
  * Kenney también tiene paquetes de audio geniales como "UI Audio" y "Jingles" (para cuando pasas de nivel).

---

# Siguientes Pasos Recomendados
1. **Importar este PRD:** Súbelo a tu herramienta de gestión (Antigravity, Jira, Trello, Notion).
2. **Definir el Arte:** Decide si el juego será 2D (vista lateral o superior) o 3D (vista trasera como *Subway Surfers*). Esto definirá qué assets descargar.
3. **Prueba de Concepto (MVP):** Crea un nivel básico donde un cubo (tu personaje) se mueva a la izquierda o derecha en 3 carriles, detectando colisiones con cubos que tengan los números de respuesta.