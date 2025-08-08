# Freshjelly Portfolio

A lightweight, accessible portfolio website built with Astro and Tailwind CSS. Features bilingual content (English/Japanese), dark mode support, and smooth animations.

![Freshjelly Portfolio](./public/og-image.jpg)

## ✨ Features

- **🚀 Fast & Lightweight**: Built with Astro for optimal performance
- **🌙 Dark Mode**: Toggle between light and dark themes with system preference detection
- **🌐 Bilingual**: English and Japanese content support
- **♿ Accessible**: WCAG compliant with proper ARIA labels, keyboard navigation, and skip links
- **📱 Responsive**: Mobile-first design that works on all devices
- **🎨 Modern Design**: Clean, minimal aesthetic with gradient backgrounds
- **⚡ Smooth Animations**: Fade-in effects on scroll using IntersectionObserver
- **📋 Contact Form**: Functional contact form with validation (ready for backend integration)
- **🎯 SEO Optimized**: Proper meta tags, OpenGraph, and structured data

## 🏗️ Project Structure

```
freshjelly-portfolio/
├── public/
│   ├── images/           # Project placeholder images
│   ├── favicon.svg
│   └── og-image.jpg
├── src/
│   ├── layouts/
│   │   └── Layout.astro  # Base HTML layout with head tags
│   └── pages/
│       └── index.astro   # Main portfolio page
├── astro.config.mjs      # Astro configuration
├── tailwind.config.cjs   # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## 🛠️ Prerequisites

- Node.js (version 18.14.1 or higher)
- npm or yarn

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   
   Visit `http://localhost:4321` to view the website.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run astro` - Run Astro CLI commands

## 🎨 Customization

### Colors and Theming

The color scheme is defined in `tailwind.config.cjs`. The main theme uses:
- **Primary**: Blue tones (for main accents)
- **Secondary**: Purple tones (for highlights)
- **Background**: Gradient from blue-50 to violet-100 (light), gray-900 to violet-900 (dark)

### Content Updates

All content is defined in `src/pages/index.astro`:
- **Personal Info**: Update the hero section and about content
- **Projects**: Modify the `featuredProjects` and `hobbyProjects` arrays
- **Skills**: Update the skills section with your technologies
- **Images**: Replace placeholder images in `/public/images/`

### Contact Form

The contact form is ready for backend integration. To connect it to a service:

1. **Using Formspree** (recommended):
   ```javascript
   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: nameField.value,
       email: emailField.value,
       message: messageField.value
     })
   });
   ```

2. **Using Netlify Forms**:
   Add `data-netlify="true"` to the form element and deploy to Netlify.

3. **Custom Backend**:
   Update the form submission handler in the `<script>` section of `index.astro`.

## 🚀 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Astro and configure build settings

3. **Environment Variables** (if needed):
   - Add any required environment variables in the Vercel dashboard
   - For contact forms, add your service API keys

### Other Platforms

- **Netlify**: Works out of the box with Astro
- **Cloudflare Pages**: Excellent performance with edge deployment
- **GitHub Pages**: Requires setting `site` and `base` in `astro.config.mjs`

### Build Commands

For manual deployment:
```bash
npm run build
# Files will be generated in ./dist/
```

## 📊 Performance

This portfolio is optimized for Core Web Vitals:
- **Lightweight**: Minimal JavaScript, efficient CSS
- **Fast Loading**: Optimized images and assets
- **SEO Friendly**: Proper meta tags and structure
- **Accessible**: WCAG 2.1 AA compliant

Expected Lighthouse scores:
- Performance: 90-100
- Accessibility: 95-100
- Best Practices: 90-100
- SEO: 90-100

## 🎨 Design Philosophy

- **Minimalist**: Clean design with plenty of whitespace
- **Accessible**: High contrast ratios, keyboard navigation
- **Responsive**: Mobile-first approach
- **Fast**: Optimized for speed and performance
- **Modern**: Current design trends with subtle animations

## 🌍 Internationalization

The site supports English and Japanese content:
- Use `lang="en"` and `lang="ja"` attributes for proper screen reader support
- Content is inline for simplicity, but can be externalized to JSON/markdown files
- Meta descriptions and page titles can be localized

## 🤝 Contributing

Feel free to:
- Report issues or bugs
- Suggest improvements
- Submit pull requests
- Use this as a template for your own portfolio

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

If you have questions or need help customizing this portfolio:
- Open an issue on GitHub
- Check the [Astro documentation](https://docs.astro.build)
- Review the [Tailwind CSS documentation](https://tailwindcss.com)

---

Built with ☕ and late-night coding by Freshjelly