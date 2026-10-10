<div align="center">
  <h1>🏎️ Carrera Matemática</h1>
  <p><strong>Juego educativo de matemáticas para primaria · EduRunner Math</strong></p>
</div>

Crea tu personaje, elige tu vehículo y conduce por la carretera eligiendo el carril con la
respuesta correcta. Cuando aciertas, tu personaje sonríe y te felicita por tu nombre.

- 🎨 **Personaje a tu gusto:** nombre, piel, peinado, color de pelo, ropa y accesorios.
- 🚗 **6 vehículos:** deportivo, kart, moto, bus escolar, cohete y monster truck.
- ➕ **3 retos:** sumas (fácil), sumas y restas (medio), multiplicaciones (difícil).
- 📱 **Responsive y elegante:** diseño tipo iOS para celular, tablet y PC.
- 📶 **Funciona sin internet** (PWA) y guarda el progreso en el dispositivo.

## Cómo correrlo

```bash
cd apps/game
npm install
npm run dev       # http://localhost:5173 (también accesible desde el celular en la misma red)
npm test          # pruebas de la lógica matemática
npm run build     # build de producción en apps/game/dist
```

## Estructura

```text
apps/
├── game/        # 🎮 El juego (TypeScript + Vite, sin frameworks)
└── dashboard/   # 📊 Prototipo de panel docente (fuera del alcance actual)
docs/
└── prd_y_recomendaciones_t_cnicas.md   # PRD v2: requisitos, reglas y arquitectura
```

## Despliegue en Vercel

Crear un proyecto apuntando a este repositorio con **Root Directory = `apps/game`**
(framework Vite, build `npm run build`, salida `dist`).

Detalles completos del diseño y las reglas del juego en el [PRD](docs/prd_y_recomendaciones_t_cnicas.md).
