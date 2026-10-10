import '@fontsource-variable/nunito';
import './styles/base.css';
import './styles/screens.css';
import './styles/game.css';

import { FLOWERS, HILLS, TREES } from './art/scenery';
import { setupRouter, go } from './core/router';
import { startSync } from './core/sync';
import { creatorScreen } from './screens/creator';
import { difficultyScreen } from './screens/difficulty';
import { gameScreen } from './screens/game';
import { garageScreen } from './screens/garage';
import { homeScreen } from './screens/home';

const app = document.getElementById('app')!;

// Fondos SVG generados en código, disponibles para el CSS
app.style.setProperty('--img-hills', HILLS);
app.style.setProperty('--img-trees', TREES);
app.style.setProperty('--img-flowers', FLOWERS);

setupRouter(app, {
  home: homeScreen,
  creator: creatorScreen,
  garage: garageScreen,
  difficulty: difficultyScreen,
  game: gameScreen,
});

go('home');
startSync();
