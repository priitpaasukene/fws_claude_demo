# Browser Game Development Workflows

This document outlines common workflows and best practices for developing the browser game in this project.

## Project Structure

```
fws_claude_demo/
├── html/           # HTML templates and game screens
├── js/             # JavaScript game logic and modules
├── tests/          # Test files (unit tests, integration tests)
├── assets/         # Game assets (images, sounds, sprites)
├── css/            # Stylesheets and animations
├── index.html      # Main game entry point
└── CLAUDE.md       # This documentation file
```

## Development Workflows

### Local Development Setup

```bash
# Start a local development server
python3 -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Access the game at `http://localhost:8000`

### File Organization Conventions

#### JavaScript Files (`js/`)
- `js/game.js` - Main game loop and initialization
- `js/entities/` - Game entities (player, enemies, items)
- `js/systems/` - Game systems (physics, rendering, audio)
- `js/utils/` - Utility functions and helpers
- `js/config.js` - Game configuration and constants

#### HTML Files (`html/`)
- `html/menu.html` - Game menu screens
- `html/hud.html` - HUD templates
- `html/dialogs.html` - Modal dialogs and popups

#### CSS Files (`css/`)
- `css/main.css` - Main game styles
- `css/ui.css` - User interface styles
- `css/animations.css` - Game animations and effects

#### Assets (`assets/`)
- `assets/images/` - Sprites, backgrounds, UI elements
- `assets/audio/` - Sound effects and music
- `assets/fonts/` - Custom fonts
- `assets/data/` - Game data files (levels, configs)

#### Tests (`tests/`)
- `tests/unit/` - Unit tests for individual functions
- `tests/integration/` - Integration tests for game systems
- `tests/e2e/` - End-to-end tests for complete game flows

### Common Development Tasks

#### Adding a New Game Feature

1. Create the feature module in appropriate `js/` subdirectory
2. Add corresponding CSS in `css/` if UI elements are needed
3. Update `index.html` or create new HTML in `html/` if needed
4. Add assets to `assets/` directory
5. Write unit tests in `tests/unit/`
6. Update game.js to integrate the new feature

#### Testing Workflows

```bash
# Run unit tests (assuming Jest or similar)
npm test

# Run specific test file
npm test -- tests/unit/player.test.js

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

#### Asset Management

- Keep original assets in `assets/originals/` (not committed)
- Optimize images for web (WebP, compressed PNG/JPG)
- Use appropriate audio formats (MP3, OGG, WebM)
- Follow naming convention: `snake_case` for files
- Group related assets in subdirectories

#### Performance Optimization

- Use sprite sheets for multiple small images
- Implement object pooling for frequently created/destroyed objects
- Profile performance using browser DevTools
- Optimize game loop and rendering calls
- Compress and minify assets for production

### Debugging Workflow

#### Browser DevTools Setup

1. Open DevTools (F12)
2. Enable "Pause on exceptions" for error debugging
3. Use Console for logging game state
4. Use Performance tab for framerate analysis
5. Use Network tab for asset loading optimization

#### Common Debug Patterns

```javascript
// Game state logging
console.log('Player position:', player.x, player.y);

// Performance monitoring
console.time('render');
render();
console.timeEnd('render');

// Conditional debugging
if (DEBUG_MODE) {
    drawDebugInfo();
}
```

### Build and Deployment

#### Development Build
```bash
# No build step needed for simple browser games
# Just serve files directly
```

#### Production Build
```bash
# Minify JavaScript
npx terser js/*.js -o dist/game.min.js

# Optimize images
npx imagemin assets/images/* --out-dir=dist/assets/images

# Copy HTML and CSS
cp index.html dist/
cp -r css/ dist/css/
```

### Code Quality

#### Linting
```bash
# JavaScript linting
npx eslint js/

# CSS linting
npx stylelint css/
```

#### Code Formatting
```bash
# Format JavaScript
npx prettier --write js/

# Format CSS
npx prettier --write css/
```

### Common Game Development Patterns

#### Game Loop Structure
```javascript
function gameLoop() {
    update(deltaTime);
    render();
    requestAnimationFrame(gameLoop);
}
```

#### Entity Component System
```javascript
// Entity creation
const player = createEntity()
    .addComponent(Position, {x: 0, y: 0})
    .addComponent(Sprite, {texture: 'player.png'})
    .addComponent(Physics, {velocity: {x: 0, y: 0}});
```

#### State Management
```javascript
const gameState = {
    currentScreen: 'menu', // menu, playing, paused, gameover
    score: 0,
    level: 1,
    entities: []
};
```

### Troubleshooting

#### Common Issues

1. **Canvas not displaying**: Check canvas CSS size vs internal resolution
2. **Assets not loading**: Verify file paths and server setup
3. **Performance issues**: Profile with DevTools, check for memory leaks
4. **Input not working**: Verify event listeners and prevent default behavior
5. **Audio not playing**: Check user interaction requirements and file formats

#### Quick Fixes

```bash
# Clear browser cache
# Hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)

# Check console for errors
# Look for 404s, syntax errors, or CORS issues

# Verify file structure matches expected paths
ls -la html/ js/ css/ assets/
```

This workflow document should be updated as the project evolves and new patterns emerge.