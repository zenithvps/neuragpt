# Kimi AI - ChatGPT-Inspired Interface

A modern, elegant chat interface inspired by ChatGPT, built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern ChatGPT-inspired design
- 📱 Fully responsive layout
- 📎 File upload support
- ⌨️ Auto-resizing textarea
- 🔄 Real-time typing indicators
- 🎭 Smooth animations and transitions
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   └── ChatInterface.tsx    # Main chat interface component
├── App.tsx                  # Root application component
├── main.tsx                 # Application entry point
├── index.css               # Global styles and Tailwind imports
└── vite-env.d.ts           # Vite type definitions
```

## Customization

### API Integration

To connect to a real AI API, modify the `sendMessage` function in `ChatInterface.tsx`:

```typescript
// Replace the simulation with actual API call
const response = await fetch('YOUR_API_ENDPOINT', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: getChatHistory(),
    // other parameters
  })
});
```

### Styling

The interface uses Tailwind CSS for styling. You can customize colors, spacing, and other design elements by modifying the classes in the components.

### File Upload

The current implementation supports basic file reading for text files. For more advanced file processing (PDFs, images), you may need to integrate additional libraries or backend services.

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and development server
- **Lucide React** - Icon library
- **ESLint** - Code linting

## License

This project is open source and available under the MIT License.