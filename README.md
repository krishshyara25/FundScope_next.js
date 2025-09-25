# 📈 Mutual Fund Explorer

A comprehensive, high-performance mutual fund explorer built with **Next.js 15**, **Material-UI v7**, and **React 19**. Explore over 37,000+ mutual fund schemes with advanced filtering, analytics, and investment calculators.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3.2-purple)](https://mui.com/)

## 🚀 Live Demo

**[View Live Demo](https://your-vercel-url.vercel.app)** *(Replace with your actual Vercel URL)*

## ✨ Key Features

### 🏠 **Home Dashboard**
- Modern, responsive landing page with feature overview
- Quick navigation to all sections
- Performance-optimized layout

### 📊 **Funds Explorer** (`/funds`)
- **Browse 37,000+ mutual fund schemes** from MFAPI.in
- **Advanced Filtering System:**
  - Search by fund name or fund house
  - Filter by category (Equity, Debt, Hybrid, ELSS, etc.)
  - Filter by fund house (HDFC, ICICI, SBI, Axis, etc.)
- **Smart Pagination:** 50 funds per page for optimal performance
- **Intelligent Sorting:** By name, fund house, or category
- **Grid/List View Toggle** for different viewing preferences
- **Real-time Search** with 500ms debouncing
- **Performance Optimized** with caching and server-side filtering

### 📈 **Analytics Dashboard** (`/analytics`)
- **Market Overview Statistics**
  - Total schemes count
  - Fund house distribution
  - Category breakdown
- **Top Categories Analysis** with fund counts
- **Top Fund Houses Ranking** by number of schemes
- **Interactive Cards** with detailed insights
- **Real-time Data** from live API

### 🧮 **Investment Calculator** (`/calculator`)
- **SIP (Systematic Investment Plan) Calculator**
  - Monthly investment amount slider (₹500 - ₹1,00,000)
  - Investment period selector (1-30 years)
  - Expected return rate slider (1-30% per annum)
  - Real-time calculation display
- **Lump Sum Investment Calculator**
  - One-time investment amount (₹1,000 - ₹10,00,000)
  - Investment duration (1-30 years)
  - Expected return rate (1-30% per annum)
- **Currency Formatting** for Indian Rupees
- **Interactive Sliders** with immediate feedback

### 🔍 **Individual Fund Details** (`/scheme/[code]`)
- Detailed scheme information
- Fund house and category details
- Performance metrics
- Direct links from fund listings

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.4 with App Router
- **Frontend:** React 19.1.0
- **UI Library:** Material-UI (MUI) v7.3.2
- **Styling:** Emotion (CSS-in-JS)
- **Icons:** Material-UI Icons
- **API:** MFAPI.in for mutual fund data
- **Caching:** Custom in-memory caching system
- **Performance:** Server-side filtering and pagination

## 🏗️ Architecture Highlights

### **Performance Optimizations**
- **Smart Caching:** 12-hour TTL for API responses
- **Server-Side Filtering:** Reduces client-side processing
- **Pagination:** 50 items per page prevents browser overload
- **Debounced Search:** 500ms delay for efficient API calls
- **Code Splitting:** Route-based splitting with Next.js

### **Data Processing Intelligence**
- **Fund House Extraction:** Pattern-matching algorithms to identify fund houses from scheme names
- **Category Classification:** Intelligent categorization based on scheme name analysis
- **Data Normalization:** Converts MFAPI.in data structure for consistent frontend usage

### **Responsive Design**
- **Mobile-First Approach** with Material-UI Grid system
- **Adaptive Layouts** for different screen sizes
- **Touch-Friendly** interface elements

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mutual-fund-explorer.git
   cd mutual-fund-explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
mutual-fund-explorer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.js          # Root layout with navigation
│   │   ├── page.js            # Home dashboard
│   │   ├── not-found.js       # 404 error page
│   │   ├── globals.css        # Global styles
│   │   ├── funds/             # Funds listing page
│   │   │   └── page.jsx       # Main funds explorer
│   │   ├── analytics/         # Analytics dashboard
│   │   │   └── page.jsx       # Market insights
│   │   ├── calculator/        # Investment calculators
│   │   │   └── page.jsx       # SIP & Lump sum calculators
│   │   ├── scheme/            # Individual fund details
│   │   │   └── [code]/        # Dynamic route for fund details
│   │   │       └── page.jsx   # Fund detail page
│   │   └── api/               # API routes
│   │       ├── mf/            # Main funds API
│   │       │   └── route.js   # Funds data with filtering
│   │       └── scheme/        # Individual scheme APIs
│   │           └── [code]/    # Scheme-specific endpoints
│   ├── components/            # Reusable UI components
│   │   ├── FundsList.jsx      # Funds listing component
│   │   ├── NavChart.jsx       # Navigation chart component
│   │   ├── SchemeDetails.jsx  # Scheme details component
│   │   ├── SipCalculator.jsx  # SIP calculator component
│   │   ├── LoadingComponents.jsx    # Loading states
│   │   └── PerformanceComponents.jsx # Performance indicators
│   ├── lib/                   # Utility libraries
│   │   ├── cache.js          # In-memory caching system
│   │   └── utils.js          # General utilities
│   ├── utils/                 # Calculation utilities
│   │   └── calculator.js     # Investment calculation functions
│   └── theme.js              # Material-UI theme configuration
├── public/                    # Static assets
│   ├── next.svg              # Next.js logo
│   ├── vercel.svg            # Vercel logo
│   └── favicon.ico           # Site favicon
├── package.json              # Dependencies and scripts
├── next.config.mjs           # Next.js configuration
├── jsconfig.json            # JavaScript configuration
└── eslint.config.mjs        # ESLint configuration
```

## 🔧 Configuration

### Environment Variables
No environment variables required - the app uses public APIs.

### API Configuration
- **Data Source:** MFAPI.in (https://api.mfapi.in/mf)
- **Cache Duration:** 12 hours
- **Rate Limiting:** Built-in with caching

## 🎨 UI/UX Features

### Design System
- **Modern Material Design** with custom theme
- **Consistent Color Palette:**
  - Primary: #2563eb (Modern Blue)
  - Secondary: #059669 (Emerald Green)
  - Error: #dc2626 (Red for negative returns)
- **Typography:** Inter font family for readability
- **Shadows & Elevation** for depth perception

### Interactions
- **Smooth Animations** with Fade transitions
- **Hover Effects** on interactive elements
- **Loading States** with skeleton placeholders
- **Error Handling** with user-friendly messages

## 📊 Performance Metrics

- **Initial Page Load:** ~175KB JavaScript
- **Funds Page:** Optimized for 37,000+ items with pagination
- **Search Response:** <500ms with debouncing
- **Build Size:** Optimized with Next.js automatic splitting

## 🔄 API Endpoints

### Public API Routes

- `GET /api/mf` - Get all mutual funds with filtering
  - Query params: `page`, `limit`, `search`, `category`, `fundHouse`
- `GET /api/scheme/[code]` - Get individual scheme details
- `GET /api/scheme/[code]/returns` - Get scheme return data
- `GET /api/scheme/[code]/sip` - Get SIP-related data

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel automatically detects Next.js and deploys

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `.next` folder and `package.json`
3. Install dependencies and start: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## 🙏 Acknowledgments

- **MFAPI.in** for providing free mutual fund data
- **Material-UI** for the excellent component library
- **Next.js** team for the amazing framework
- **Vercel** for seamless deployment

---

