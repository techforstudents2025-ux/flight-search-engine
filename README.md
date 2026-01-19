<<<<<<< HEAD
<<<<<<< HEAD
# flight-search-engine
A responsive Flight Search Engine with real-time price graph and advanced filtering
=======
# ✈️ Flight Search Engine

A responsive Flight Search Engine with real-time price visualization and advanced filtering capabilities.

![Flight Search Demo](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Languages](https://img.shields.io/badge/languages-Arabic%20%26%20English-orange)

## 🌟 Features

### 🔍 **Smart Search Interface**
- Origin/Destination airport selection with auto-suggest
- Date picker with range selection
- Passenger counter and class selection
- Real-time validation

### 📊 **Live Price Graph**
- Real-time price updates every 30 seconds
- Interactive charts using Recharts
- Price trend visualization
- Historical price data

### 🎯 **Advanced Filtering**
- Simultaneous multi-filter support:
  - Number of stops (Direct, 1 stop, 2+ stops)
  - Price range slider
  - Airlines multi-select
  - Departure time windows
  - Flight duration limits
- Instant reflection on both list and graph

### 🌐 **Multilingual Support**
- Full Arabic/English support
- Automatic RTL/LTR switching
- Localized dates and currencies
- Persistent language preference

### 📱 **Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly controls
- Collapsible filters for mobile

## 🚀 Live Demo

[View Live Demo](https://flight-search-engine.vercel.app)

## 📸 Screenshots

| Desktop View | Mobile View |
|--------------|-------------|
| ![Desktop](https://via.placeholder.com/800x450/3b82f6/ffffff?text=Desktop+View) | ![Mobile](https://via.placeholder.com/400x700/10b981/ffffff?text=Mobile+View) |

## 🛠️ Tech Stack

- **Frontend:** React 18, JavaScript (ES6+)
- **Charts:** Recharts
- **Styling:** CSS3, Flexbox, Grid
- **Icons:** React Icons
- **Date Handling:** date-fns
- **HTTP Client:** Axios
- **State Management:** React Hooks
- **Internationalization:** Custom i18n implementation

## 📁 Project Structure

```

flight-search-engine/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.js          # Navigation with language switcher
│   │   ├── SearchForm.js      # Flight search interface
│   │   ├── FlightResults.js   # Flight listings with sorting
│   │   ├── PriceGraph.js      # Live price visualization
│   │   ├── Filters.js         # Advanced filtering system
│   │   └── LanguageSwitcher.js # Language toggle component
|   |   services/
|   |   |__ amadeusService.js
│   ├── i18n/
│   │   ├── ar.json           # Arabic translations
│   │   ├── en.json           # English translations
│   │   └── LanguageContext.js # Language context provider
│   ├── hooks/
│   │   └── useTranslation.js # Translation hook
│   ├── App.js                # Main application
│   ├── App.css               # Global styles
│   └── index.js              # Entry point
├── package.json
└── README.md

```

## 🚦 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/techforstudents2025-ux/flight-search-engine.git
   cd flight-search-engine
```

1. Install dependencies
   ```bash
   npm install
   ```
2. Run development server
   ```bash
   npm start
   ```
3. Open in browser
   ```
   http://localhost:3000
   ```

Build for Production

```bash
npm run build
```

📊 API Integration

The application is ready for integration with flight APIs:

Supported APIs:

· Amadeus Self-Service API (Test environment)
· Sky-Scanner API
· Mock data for development/testing

To enable real API:

1. Get API credentials from Amadeus/Sky-Scanner
2. Update src/services/flightService.js
3. Set environment variables
4. Remove mock data fallback

🔧 Key Technical Decisions

1. Why Recharts over D3?

· Easier integration with React
· Built-in responsiveness
· Smaller bundle size
· Better performance for real-time updates

2. Component Structure

· Modular, reusable components
· Custom hooks for shared logic
· Context API for global state (language)

3. Performance Optimizations

· Memoized components with React.memo
· Debounced search inputs
· Lazy loading for charts
· Optimized re-renders

4. Accessibility

· ARIA labels for screen readers
· Keyboard navigation support
· High contrast modes
· Semantic HTML structure

🌍 Internationalization

The app supports complete bilingual functionality:

· Arabic: Right-to-left layout, Hijri dates support
· English: Left-to-right layout, Gregorian dates
· Features:
  · Dynamic text direction switching
  · Localized date formats
  · Currency symbol changes
  · RTL-aware CSS adjustments

📱 Responsive Breakpoints

Device Breakpoint Features
Mobile < 768px Collapsible filters, touch targets
Tablet 768px - 1024px Two-column layout, larger buttons
Desktop 1024px Full sidebar, detailed information

🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

🤝 Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments

· Icons by React Icons
· Charts by Recharts
· Design inspired by modern flight search engines
· Special thanks to the React community

📞 Contact

Ameen Alsharafi - GitHub

Project Link: https://github.com/techforstudents2025-ux/flight-search-engine
>>>>>>> 741452a (Add complete multilingual flight search engine with all features)
=======
# flight-search-engine
>>>>>>> 748fa77729f46d9e8e3b27390689ed54b5174abb

