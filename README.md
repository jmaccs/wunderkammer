# Wunderkammer

A 3D interactive web experience built with Svelte, Threlte, and Three.js. View the live demo at [https://wunderkammer.onrender.com/](https://wunderkammer.onrender.com/)

## Features

- Interactive 3D environment with multiple models and scenes
- Custom shaders and visual effects
- Screen UI components for navigation and interaction
- Model viewer with search functionality
- Interactive controls and animations
- Sound integration (WIP)
- Responsive design (WIP)

## Tech Stack

- [Svelte](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/)
- [Threlte](https://threlte.xyz/) for 3D rendering in Svelte
- [Three.js](https://threejs.org/) for 3D graphics
- [TailwindCSS](https://tailwindcss.com/) for styling
- Custom GLSL shaders
- Camera controls and post-processing effects

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wunderkammer.git
cd wunderkammer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Sketchfab API key:
```
VITE_SKETCHFAB_TOKEN=your_api_key_here
```
You'll need to create a Sketchfab account and generate an API key to run the project locally.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

- `/src/lib/components/models/` - 3D models and scene components
- `/src/lib/components/models/screenui/` - UI overlay components
- `/src/lib/components/models/shaders/` - Custom GLSL shaders
- `/src/lib/components/utils/` - Utility functions and stores
- `/static/models/` - 3D model assets
- `/static/img/` - Image assets
- `/static/fonts/` - Custom fonts
