# PRD — Carrera Matemática (EduRunner Math) · v2

> Esta versión reemplaza al PRD anterior. El foco ya **no** es el panel docente:
> lo que importa es un **juego bonito, elegante, responsive y que funcione**.

## 1. Visión

Un juego web para niños de primaria que practica **suma, resta y multiplicación**.
El niño crea su propio personaje, elige un vehículo y conduce por una carretera de
3 carriles: las respuestas llegan en burbujas y debe ir al carril con la respuesta
correcta. Cuando acierta, **su personaje sonríe y lo felicita por su nombre**.

Principios de diseño:

1. **Primero que funcione y se sienta bien.** Cero errores, respuesta táctil inmediata.
2. **Elegante tipo iPhone.** Tarjetas de vidrio esmerilado, esquinas muy redondeadas,
   sombras suaves, tipografía redondeada, animaciones con rebote (spring).
3. **Responsive real.** Celular vertical, celular horizontal, tablet y PC.
4. **Para niños.** Botones grandes, textos cortos, sin "game over", refuerzo positivo.
5. **Offline.** Una vez abierto, funciona sin internet (PWA).

## 2. Alcance

| Dentro (v2) | Fuera (futuro) |
| --- | --- |
| Creador de personaje (nombre, piel, peinado, color de pelo, ropa, accesorio) | Panel docente / analítica (`apps/dashboard` queda como prototipo) |
| 6 vehículos predeterminados con el personaje dentro | Cuentas de usuario / login |
| 3 dificultades, niveles infinitos con progresión | Multijugador |
| Personaje con expresiones (normal, feliz, "¡uy!") | Tienda / desbloqueables |
| Sonidos, vibración, confeti, estrellas | Backend propio (solo hay un gancho opcional de sincronización) |
| Guardado local y modo sin internet | |

## 3. Flujo del jugador

```
Portada ──► Creador de personaje ──► Garaje (vehículo) ──► Elegir reto ──► Juego
   ▲                                                                       │
   └──────────────────────── Menú / Nivel superado ◄───────────────────────┘
```

- **Primera vez:** Portada → «Comenzar» → Creador → Garaje → Reto → Juego.
- **Siguientes veces:** la portada saluda («¡Hola, Valentina!») con su avatar y su
  precisión; «Jugar» va directo a elegir el reto; «Cambiar personaje» reabre el creador.

## 4. Pantallas

### 4.1 Portada
Título «Carrera Matemática» con degradado, escena animada (nubes, colinas, árboles,
carretera) con el vehículo y el personaje del jugador sonriendo. Botón de sonido.

### 4.2 Creador de personaje
- Vista previa grande del avatar; **sonríe cada vez que se cambia algo**.
- Campo «¿Cómo te llamas?» (máx. 12 caracteres; si queda vacío se usa «Piloto»).
- Control segmentado estilo iOS: **Piel (6) · Peinado (6) · Color (7) · Ropa (8) · Extra (6)**.
  - Peinados: Corto, Puntas, Rizado, Largo, Coletas, Moño.
  - Extras: Nada, Gafas, Gorra, Lazo, Audífonos, Corona.
- Botón 🎲 para un personaje aleatorio.

### 4.3 Garaje
Carrusel (celular) o cuadrícula (PC) con 6 vehículos, **cada uno mostrando al
personaje ya sentado dentro**: Rayo (deportivo), Kart Turbo, Vespi (moto), Bus Escolar,
Cohete y Monster. El seleccionado se anima y el personaje sonríe.

### 4.4 Elegir reto
| Dificultad | Contenido | Nivel 1 | Niveles altos |
| --- | --- | --- | --- |
| Fácil | Sumas de una cifra | sumandos 1–5 | sumandos 1–9 |
| Medio | Sumas y restas (sin negativos) | hasta 20 | hasta 50 |
| Difícil | Multiplicaciones | tablas 2–5 | tablas 2–10 |

Muestra el mejor nivel alcanzado en cada dificultad.

### 4.5 Juego
- **HUD:** pausa, avatar en vivo + nombre, puntos y racha.
- **Tarjeta de pregunta:** `7 + 5 = ?` grande y barra de progreso por segmentos.
- **Pista:** vista lateral con 3 carriles horizontales; el vehículo a la izquierda y
  3 burbujas de respuesta que avanzan desde la derecha, una por carril.

## 5. Reglas del juego

- Cuenta regresiva **3 · 2 · 1 · ¡Ya!** al iniciar cada nivel.
- Las burbujas tardan `travelSeconds` en llegar (Fácil 7 s, Medio 8,5 s, Difícil 8 s;
  −0,6 s por nivel, mínimo 3,6 s). Al tocar una burbuja el vehículo va a ese carril y
  las burbujas aceleran (×3,2) para no hacer esperar a quien ya respondió.
- **Acierto:** +10 puntos (+5 extra con racha ≥ 3), confeti, salto del vehículo,
  el personaje **sonríe** en el carro y en el HUD, y aparece la tarjeta
  «¡Genial, *nombre*! +10 puntos» con su cara feliz grande.
- **Error:** cara de «¡uy!», sacudida suave, destello rojo en los bordes, vibración,
  la burbuja correcta se ilumina en verde y se muestra «¡Casi! Era 12 · ¡Tú puedes!».
  No hay vidas ni "game over".
- **Nivel superado** al llegar a la meta de aciertos (5 en el nivel 1, +1 por nivel, máx. 8).
  Hoja con el personaje feliz en su vehículo, **estrellas** (3 = sin errores,
  2 = hasta 2 errores, 1 = más), aciertos, errores y puntos.
- Distractores creíbles: cercanos a la respuesta (±1, ±2, ±3, ±10 y, en
  multiplicación, la tabla vecina), distintos entre sí y nunca negativos.
- Nunca se repite la misma pregunta dos veces seguidas.

### Controles
| Entrada | Acción |
| --- | --- |
| Tocar una burbuja | Elegir esa respuesta (mueve y acelera) |
| Tocar un carril / deslizar arriba-abajo | Cambiar de carril |
| Teclas `1` `2` `3` | Elegir carril superior / medio / inferior |
| `↑` `↓` o `W` `S` | Cambiar de carril |
| `Espacio` / `Enter` | Confirmar el carril actual |
| `Esc` / `P` | Pausa |

El juego se pausa solo si la pestaña se oculta.

## 6. Dirección de arte

- **Paleta iOS:** azul `#007AFF`, verde `#34C759`, naranja `#FF9500`, rojo `#FF3B30`,
  morado `#AF52DE`, rosa `#FF2D55`, amarillo `#FFCC00`; texto `#1C1C1E`.
- **Superficies:** vidrio esmerilado (`backdrop-filter: blur`), bordes blancos
  translúcidos, radios de 18–32 px, sombras en capas.
- **Tipografía:** SF Pro Rounded en Apple (`ui-rounded`) y Nunito (incluida en el
  paquete, funciona offline) en el resto.
- **Arte 100 % SVG generado en código:** avatares por capas, vehículos en vista lateral,
  colinas/árboles en paralaje. Nítido en cualquier pantalla y sin descargas extra.
- **En PC/tablet** el juego se muestra dentro de un marco tipo dispositivo con
  esquinas redondeadas sobre un fondo de manchas de color difuminadas; en celular
  ocupa toda la pantalla respetando el notch (`safe-area-inset`).
- Las hojas modales suben desde abajo como en iOS (en PC aparecen centradas).

## 7. Arquitectura técnica

Se eliminó Phaser: la interfaz es HTML/CSS (más nítida, accesible y fácil de
estilizar) y la carretera se anima con `requestAnimationFrame` + `transform`.

- **Stack:** TypeScript + Vite 8 + `vite-plugin-pwa` · sin framework de UI.
- **Tamaño:** ~40 KB de JS (14 KB gzip).

```
apps/game/
├── index.html
├── public/                  # favicon e íconos de la app (PWA / iOS)
└── src/
    ├── main.ts              # arranque y rutas
    ├── art/
    │   ├── avatar.ts        # avatar SVG por capas + 3 expresiones
    │   ├── vehicles.ts      # 6 vehículos con el personaje dentro
    │   └── scenery.ts       # colinas, árboles, flores, nubes
    ├── core/
    │   ├── math.ts          # preguntas, distractores, progresión (funciones puras)
    │   ├── store.ts         # guardado local (perfil, récords, sesiones pendientes)
    │   ├── sync.ts          # envío opcional de sesiones (VITE_SYNC_URL)
    │   ├── sound.ts         # efectos con Web Audio (sin archivos)
    │   ├── router.ts        # navegación con transiciones
    │   ├── ui.ts, icons.ts, dom.ts
    │   └── __tests__/       # pruebas de la lógica matemática (Vitest)
    ├── screens/             # home, creator, garage, difficulty, game
    └── styles/              # base.css (tokens/componentes), screens.css, game.css
```

### Datos y modo offline
- Todo se guarda en `localStorage` (`edurunner:v2`): perfil, sonido, mejores niveles,
  totales y una cola de sesiones.
- El Service Worker precachea todo (código, estilos, fuente, íconos).
- Si se define `VITE_SYNC_URL`, al recuperar conexión se envía la cola con
  `POST { sessions: [...] }` y se borra lo enviado. Sin esa variable no se envía nada.

### Accesibilidad
Botones reales con `aria-label`, `aria-live` en pregunta y felicitaciones, control por
teclado, foco visible, `prefers-reduced-motion` respetado.

## 8. Calidad

- `npm test` — pruebas de la lógica (opciones distintas, sin negativos, la respuesta
  coincide con la operación, sumas de una cifra en Fácil, no repetición, progresión).
- `npm run build` — verificación de tipos estricta + build.
- Revisado visualmente en 390×844 (iPhone), 844×390 (horizontal) y 1440×900 (PC).

## 9. Despliegue (Vercel)

Proyecto con **Root Directory = `apps/game`**, framework Vite, comando `npm run build`,
salida `dist`. El panel `apps/dashboard` es opcional y se despliega aparte solo si se
retoma en el futuro.

## 10. Siguientes pasos sugeridos

1. Prueba con niños reales y ajuste de velocidades por grado escolar.
2. Más contenido: divisiones, completar el número que falta (`? + 4 = 9`).
3. Desbloquear vehículos/accesorios con estrellas.
4. Si la tesis lo requiere, retomar el panel docente usando la cola de sesiones.
