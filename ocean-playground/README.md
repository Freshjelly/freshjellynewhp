# 🌊 Freshjelly's Ocean Playground

An immersive WebGL ocean experience built with React Three Fiber, featuring advanced dive animations, procedural 3D objects, and cutting-edge underwater effects. Experience the depths of creativity through interactive exploration!

![Ocean Playground](./public/og-ocean.jpg)

> **✨ Enhanced Version 2.0** - Now featuring dive animations, procedural object generation, enhanced performance optimization, and full accessibility support!

## ✨ Features

### 🏊 Core Experience
- **🌊 Advanced Dive System**: Seamless surface-to-depth transitions with realistic camera animations (3.2s dive, 1.2s for reduced motion)
- **🏺 Procedural 3D Objects**: Auto-generated objects when GLTFs aren't available (FloatRing, TreasureChest, GlassBottle)
- **💫 Enhanced Bubble System**: High-performance InstancedMesh with 150 bubbles (60 on mobile), click-triggered burst effects
- **🌀 Dynamic Ocean Surface**: Depth-responsive water shader with wave animation and caustics effects
- **👁️ Smart Object Labels**: Proximity-based descriptions (EN/JP) that only appear when underwater (depth ≥ 0.25)

### 🎨 Visual Effects
- **🌅 Depth-Based Lighting**: Sun intensity and color temperature adapt to diving depth
- **🌊 Advanced Ocean Shaders**: Multi-octave noise waves with fresnel reflections and foam generation
- **🎭 Post-Processing Pipeline**: Bloom (0→0.35), Vignette (0.05→0.14), and subtle Chromatic Aberration
- **🎨 Atmospheric Systems**: Dynamic fog density and color progression based on depth
- **✨ Glassmorphism UI**: Enhanced blur effects with accessibility-focused design

### 📱 Performance & Accessibility
- **⚡ Smart Performance Scaling**: Auto-detects mobile/low-power devices and adjusts quality accordingly
- **♿ Full A11y Support**: WCAG 2.1 AA compliant with keyboard navigation, focus rings, and screen readers
- **🎛️ Reduced Motion Support**: Respects `prefers-reduced-motion` with shortened animations and reduced effects
- **📱 Mobile Optimization**: Touch controls, reduced geometry, disabled shadows, optimized DPR
- **⏸️ Tab Visibility Management**: Automatically reduces performance when tab is inactive

### 🎮 Interactive Controls
- **🌊 Dive/Surface Controls**: Dedicated buttons for depth control with visual feedback
- **⌨️ Keyboard Shortcuts**: `R`=reset layout, `H`=hide UI, `L`=toggle low power, `ESC`=close panels
- **🎲 Seeded Random Layout**: Procedural object placement with Poisson disk sampling (non-overlapping)
- **🎯 Enhanced Object Interaction**: Click-to-burst bubbles, hover descriptions, GSAP scale animations
- **📊 Real-time Depth Indicator**: Visual depth percentage display during underwater exploration

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation
```bash
# Clone or download the project
cd ocean-playground

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser
# Visit http://localhost:5173
```

### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🎮 Controls & Navigation

### 🌊 Dive Controls
- **Dive Button**: Initiate dive from surface to underwater depths (right-bottom corner)
- **Surface Button**: Return to surface from underwater depths
- **Scroll to Dive**: First mouse wheel scroll triggers automatic dive (can be disabled with reduced motion)
- **Auto-Skip**: Users with `prefers-reduced-motion` skip animation and start at shallow depth (40%)

### 🎛️ Camera Controls
- **Mouse/Touch Drag**: Rotate camera around the scene (disabled rotation limits for immersion)
- **Mouse Wheel/Pinch**: Zoom in and out (3-25 unit range, disabled in reduced motion)
- **Touch**: Full touch support with gesture recognition for mobile devices
- **Damping**: Smooth camera movement with configurable damping factor

### ⌨️ Keyboard Shortcuts
- **`R` Key**: Regenerate object layout with new random seed
- **`H` Key**: Toggle UI visibility (hide/show all interface elements)
- **`L` Key**: Toggle low power mode (reduces effects and geometry)
- **`ESC` Key**: Close any open panels (About, Works, Contact)

### 🎯 Object Interaction
- **Hover/Touch**: Display bilingual descriptions (English + Japanese) when underwater
- **Click Objects**: Trigger bubble burst effects around clicked objects
- **Proximity Labels**: Smart labels appear only when diving deep enough (depth ≥ 25%)
- **Scale Animation**: Objects smoothly scale up on hover/focus with GSAP

### 📱 Mobile-Specific Controls
- **Touch Navigation**: Optimized touch targets for mobile devices
- **Gesture Support**: Pinch-to-zoom and drag-to-rotate with momentum
- **Reduced Complexity**: Automatic reduction in bubble count and effects
- **Battery Friendly**: Auto-enables low power mode on mobile detection

## 🏗️ Project Structure

```
ocean-playground/
├── public/                    # Static assets
│   ├── favicon.svg           # Ocean-themed favicon with animated bubbles
│   ├── og-ocean.jpg         # Social media preview image
│   └── models/              # Optional 3D models (GLTFs) - falls back to procedural
├── src/
│   ├── components/          # React Three Fiber components
│   │   ├── DiveSystem.jsx             # Advanced dive animation controller
│   │   ├── EnhancedBubbleSystem.jsx   # InstancedMesh bubble system (150 bubbles)
│   │   ├── EnhancedOceanSurface.jsx   # Depth-responsive water shader
│   │   ├── ObjectsCluster.jsx         # Seeded random object placement
│   │   ├── PostProcessingEffects.jsx  # Bloom, Vignette, Chromatic Aberration
│   │   ├── Loading.jsx                # Animated loading screen
│   │   ├── objects/                   # Procedural 3D objects
│   │   │   ├── FloatRing.jsx         # Striped swim ring with shaders
│   │   │   ├── TreasureChest.jsx     # Wooden chest with metal hardware
│   │   │   └── GlassBottle.jsx       # Refractive glass with internal message
│   │   └── ui/                        # Enhanced UI system
│   │       ├── Overlay.jsx           # Main UI with dive controls
│   │       └── panels/               # Modal panels
│   │           ├── AboutPanel.jsx    # Animated about information
│   │           ├── WorksPanel.jsx    # Portfolio showcase
│   │           └── ContactPanel.jsx  # Functional contact form
│   ├── state/               # State management
│   │   └── useAppState.js   # Zustand store (depth, diving, performance, UI)
│   ├── shaders/            # Custom GLSL shaders
│   │   ├── oceanFragment.glsl       # Enhanced ocean surface fragment
│   │   └── oceanVertex.glsl         # Multi-octave wave vertex shader
│   ├── utils/              # Utility functions
│   │   └── useWindowSize.js        # Responsive hook
│   ├── App.jsx             # Enhanced main app with performance optimization
│   ├── index.css           # Global styles with Inter + Noto Sans JP
│   └── main.jsx            # Application entry point
├── index.html              # HTML template with enhanced meta tags
├── package.json            # Dependencies (added Zustand, postprocessing)
├── vite.config.js          # Vite configuration
└── README.md               # This comprehensive documentation
```

## 🛠️ Technical Details

### Core Technologies
- **React 18**: Modern React with hooks, concurrent features, and Suspense
- **React Three Fiber**: Declarative React renderer for Three.js with performance optimizations
- **@react-three/drei**: Extended component library (OrbitControls, Environment, Html, Water)
- **@react-three/postprocessing**: Professional post-processing effects pipeline
- **Three.js 0.158+**: Latest 3D graphics library with WebGL2 support
- **GSAP 3.12**: Professional animation library with timeline control
- **Zustand 4.4**: Lightweight state management with selectors and persistence
- **Vite 5.0**: Ultra-fast build tool with optimized bundling

### 🚀 Performance Optimizations
- **Adaptive Quality Scaling**: Real-time performance monitoring with automatic LOD adjustment
- **InstancedMesh Systems**: High-performance rendering for bubbles (single draw call for 150 objects)
- **Frustum Culling**: Automatic object culling for off-screen elements
- **Tab Visibility Management**: Reduces GSAP ticker to 10fps when tab is inactive
- **Device-Specific Scaling**: Mobile gets 60 bubbles vs 150 on desktop, reduced shadow quality
- **Memory Management**: Proper cleanup of geometries, materials, and textures
- **Reduced Motion Support**: Honors system preferences with 1.2s animations vs 3.2s

### 🎨 Advanced Shaders & Effects
- **Multi-Octave Ocean Shader**: Combines multiple noise layers for realistic wave patterns
- **Depth-Responsive Materials**: Water color and opacity change based on dive depth
- **Fresnel Reflections**: Realistic water surface reflections with viewing angle
- **Caustics Simulation**: Underwater light patterns with animated caustics
- **Post-Processing Pipeline**: 
  - Bloom with luminance threshold (PC only)
  - Dynamic vignette based on depth (0.05 → 0.14)
  - Subtle chromatic aberration for underwater distortion
- **Procedural Object Shaders**: Custom stripe patterns, wood grain, glass refraction

## 🎨 Customization

### 🏺 Adding New Procedural Objects
1. Create component in `src/components/objects/YourObject.jsx`
2. Add to `ObjectsCluster.jsx` object types array
3. Include bilingual descriptions (EN/JP) for underwater labels
4. Implement hover/focus animations with GSAP

### 🌊 Dive Animation Customization
- Modify `DiveSystem.jsx` camera keyframes and timing
- Adjust depth mapping functions in `useAppState.js`
- Customize fog, lighting, and color transitions
- Add new depth-triggered effects or UI elements

### Modifying Ocean Colors
Edit the color values in `OceanSurface.jsx`:
```jsx
waterColor: 0x006994,  // Deep ocean blue
sunColor: 0x87ceeb,    // Sky blue for sun rays
```

### Adjusting Performance
Modify performance settings in `App.jsx`:
```jsx
// Reduce bubble count for lower-end devices
<BubbleSystem count={isMobile ? 15 : 30} />

// Adjust DPR (Device Pixel Ratio) for quality vs performance
dpr={isMobile ? [1, 1.5] : [1, 2]}
```

### UI Customization
- Colors and styling: Edit `src/index.css`
- Panel content: Modify components in `UIOverlay.jsx`
- Add new panels: Extend the panel system with new components

## 📱 Mobile & Accessibility Features

### 🔋 Automatic Mobile Optimizations
- **Smart Detection**: Combines screen size + user agent detection
- **Reduced Complexity**: 60 bubbles (vs 150), simplified shaders, no shadows
- **Battery Optimization**: Auto-enables low power mode, reduces DPR to [1, 1.5]
- **Memory Management**: Lower resolution textures, simplified geometries
- **Performance Scaling**: Disables post-processing effects (Bloom, Chromatic Aberration)

### 👆 Enhanced Touch Interactions
- **Gesture Recognition**: Native pinch-to-zoom and drag-to-rotate
- **Touch Targets**: Enlarged buttons (44px minimum) for accessibility
- **Haptic Feedback**: Visual feedback for touch interactions
- **Momentum Scrolling**: Natural camera movement with inertia

### ♿ Comprehensive Accessibility Support
- **WCAG 2.1 AA Compliance**: High contrast ratios, focus indicators
- **Keyboard Navigation**: Full keyboard support with Tab, Arrow keys, Enter/Space
- **Screen Reader Support**: Proper ARIA labels, roles, and live regions
- **Reduced Motion**: Honors `prefers-reduced-motion` system setting
- **Focus Management**: Visible focus rings, logical tab order
- **Color Independence**: Information not conveyed by color alone

## 🌐 Browser Support

### Recommended Browsers
- **Chrome/Edge**: Full WebGL 2.0 support
- **Firefox**: Excellent performance and compatibility
- **Safari**: Good support with some limitations
- **Mobile Safari/Chrome**: Optimized mobile experience

### WebGL Requirements
- WebGL 1.0 minimum (WebGL 2.0 recommended)
- Hardware acceleration enabled
- Modern graphics drivers

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Automatic deployment with optimized settings

### Netlify
```bash
npm run build
# Deploy the 'dist' folder to Netlify
```

### Static Hosting
The build creates static files that can be hosted anywhere:
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🐛 Troubleshooting

### 🔧 Common Issues & Solutions

**🌊 Dive Animation Not Working**
- Check if `prefers-reduced-motion` is enabled (starts at 40% depth instead)
- Verify JavaScript is enabled and GSAP is loading properly
- Try clicking the "Dive" button instead of scrolling

**📱 Poor Mobile Performance**
- Low power mode automatically enables - toggle with `L` key or button
- Close other browser tabs and apps for more memory
- Clear browser cache and try again
- Check that hardware acceleration is enabled in browser settings

**🎮 Controls Not Responding**
- Ensure WebGL is supported and enabled
- Try in private/incognito mode to rule out extensions
- Check browser console for errors (F12 → Console)
- Verify touch/mouse events aren't blocked by other elements

**🌊 Objects Missing or Invisible**
- Objects only appear underwater (depth ≥ 25%) - dive first!
- Try regenerating layout with `R` key or Reset button
- Check if objects visibility is toggled off (button in UI)
- Some ad blockers interfere with 3D rendering - try disabling temporarily

**🎨 Visual Effects Not Loading**
- Post-processing effects disabled on mobile/low power mode
- Check WebGL2 support - fallback to WebGL1 reduces effects
- Ensure graphics drivers are updated
- Try toggling low power mode with `L` key

### ⚡ Performance Optimization Tips
- **Enable Hardware Acceleration**: Chrome Settings → Advanced → System
- **Close Background Apps**: Free up RAM and GPU resources  
- **Update Graphics Drivers**: Especially important for WebGL performance
- **Use Recommended Browsers**: Chrome/Edge for best WebGL2 support
- **Clear Browser Cache**: Remove old cached resources
- **Disable Browser Extensions**: Test in incognito mode first

## 🤝 Contributing

### Development
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both desktop and mobile
5. Submit a pull request

### Ideas for Contributions
- New interactive objects with unique behaviors
- Additional shader effects and visual improvements
- Performance optimizations
- Accessibility enhancements
- New UI panels or features

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Three.js Community**: For the amazing 3D graphics library
- **React Three Fiber**: For making Three.js declarative and React-friendly
- **@react-three/drei**: For the helpful utilities and components
- **GSAP**: For smooth, professional animations
- **Ocean Inspiration**: From countless hours staring at real ocean waves

## 🔗 Links

- [Live Demo](https://ocean-playground.vercel.app) (Replace with actual URL)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [GSAP Documentation](https://greensock.com/docs/)

---

Dive in and explore the depths of creativity! 🌊

*Built with ☕ and endless fascination with the ocean by Freshjelly*