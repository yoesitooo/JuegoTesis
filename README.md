<div align="center">
  <h1>🏃‍♂️ EduRunner Math</h1>
  <p><strong>Plataforma Gamificada de Aprendizaje Matemático a Escala Estatal</strong></p>
  
  [![Estado: En Desarrollo](https://img.shields.io/badge/Estado-En_Desarrollo-orange.svg)]()
  [![Plataforma: Web & Android](https://img.shields.io/badge/Plataforma-Web%20%7C%20Android-success.svg)]()
  [![Stack: Phaser & React](https://img.shields.io/badge/Stack-Phaser.js%20%7C%20React-blue.svg)]()
</div>

---

## 📖 Visión del Proyecto
**EduRunner** (nombre provisional) es una plataforma educativa de alto impacto diseñada para ser distribuida a nivel gubernamental y escolar. Utiliza la mecánica de juego *"Endless Runner"* (carrera infinita) para incentivar la práctica de operaciones matemáticas básicas, y la complementa con un poderoso **Dashboard Analítico** para la supervisión pedagógica.

## ✨ Características Principales
* **🌐 Offline-First:** Diseñado para entornos de baja conectividad (zonas rurales). El juego guarda el progreso localmente y lo sincroniza con la nube al detectar internet.
* **📱 Cero Fricción:** Desarrollado como PWA (Progressive Web App). Accesible desde cualquier navegador de PC o Chromebook gubernamental, y empaquetable como APK para tablets Android.
* **📊 Dashboard Multinivel:** Panel web para visualizar métricas (aciertos, errores, tiempo de uso) con jerarquías claras (Estado > Escuela > Docente).

## 🏗️ Estructura del Repositorio (Monorepo)
El proyecto está dividido en aplicaciones independientes dentro de este mismo repositorio:

```text
/
├── apps/
│   ├── game/             # 🎮 El juego interactivo (Phaser.js / TypeScript)
│   └── dashboard/        # 📊 Panel web administrativo (React.js / Vite)
├── docs/                 # 📚 Documentación técnica (PRD, Análisis)
└── README.md             # Este archivo
```

## 🛠️ Stack Tecnológico Elegido
* **Motor del Juego:** Phaser.js
* **Dashboard Administrativo:** React.js + Vite + TailwindCSS
* **Base de Datos & API:** Supabase (PostgreSQL) con soporte Offline
* **Despliegue:** Vercel (Web) / Capacitor (APK Android)

## 🚀 Hoja de Ruta (Roadmap)
- [x] Fase 1: Análisis Estratégico y Arquitectura.
- [x] Fase 1.1: Estructuración del repositorio y documentación.
- [ ] Fase 2: Andamiaje (Scaffolding) de `apps/game` y `apps/dashboard`.
- [ ] Fase 3: MVP del Juego (Mecánicas de carril y sumas básicas).
- [ ] Fase 4: MVP del Dashboard y conexión a Supabase.

---
<div align="center">
  <i>Construyendo el futuro de la educación mediante la tecnología y la gamificación.</i>
</div>
