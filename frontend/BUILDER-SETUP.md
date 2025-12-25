# Stock Overview Frontend

React frontend for the Stock Overview site, integrated with Builder.io for visual page building and connected to the Express backend API.

## Features

- 📊 **Stock Quotes**: Real-time stock price display
- 🔍 **Stock Search**: Search for stocks by company name
- 🎨 **Builder.io Integration**: Visual page builder with custom stock components
- 🔌 **Backend API Integration**: Connected to Express backend with Alpha Vantage data
- 📱 **Responsive Design**: Works on desktop and mobile

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Your Builder.io API Key

1. Go to [https://builder.io](https://builder.io)
2. Sign up for a free account
3. Create a new space/organization
4. Go to Account Settings → Space Settings
5. Copy your **Public API Key**

### 3. Configure Environment Variables

Open the `.env` file and add your Builder.io API key:

```env
REACT_APP_BUILDER_API_KEY=your_actual_builder_io_api_key
REACT_APP_API_URL=http://localhost:3001
```

### 4. Start the Development Server

Make sure your backend is running first:

```bash
# In the backend directory
cd ../backend
npm start
```

Then start the frontend:

```bash
# In the frontend directory
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── StockQuote.jsx        # Stock quote display component
│   │   ├── StockQuote.css
│   │   ├── StockSearch.jsx       # Stock search component
│   │   └── StockSearch.css
│   ├── services/
│   │   └── stockApi.js           # Backend API integration
│   ├── App.js                    # Main app with Builder.io setup
│   ├── App.css
│   └── index.js
├── .env                          # Environment variables
├── package.json
└── README.md
```

## Available Routes

### `/` - Home Page
Main page powered by Builder.io. You can design this page visually in the Builder.io editor.

### `/demo` - Demo Page
Demo page showcasing the stock components without Builder.io:
- Stock search functionality
- Live stock quote display

## Using Builder.io

### Step 1: Create Your First Page

1. Go to [builder.io](https://builder.io) and log in
2. Go to **Models** → **Page**
3. Click **+ New Entry**
4. Name your page (e.g., "Home")
5. Set the URL to `/`

### Step 2: Add Custom Stock Components

Your custom components are available in the Builder.io visual editor:

#### **StockQuote Component**
Displays real-time stock information.

**Inputs:**
- `symbol` (text): Stock ticker symbol (e.g., AAPL, TSLA, GOOGL)
- `showChart` (boolean): Show chart visualization

**Usage in Builder.io:**
1. Drag "StockQuote" from the Insert menu
2. Set the symbol (e.g., "AAPL")
3. Customize styling

#### **StockSearch Component**
Search for stocks by company name.

**Usage in Builder.io:**
1. Drag "StockSearch" from the Insert menu
2. No configuration needed
3. Users can search and select stocks

### Step 3: Design Your Page

Use Builder.io's visual editor to:
- Add sections, containers, and text
- Insert your custom StockQuote and StockSearch components
- Style everything visually
- Add buttons, images, and more
- Publish when ready

### Step 4: View Your Page

Your Builder.io page will automatically appear at the route you specified (e.g., `/`).

## Troubleshooting

### Components Not Showing in Builder.io

1. Make sure you've entered your Builder.io API key in `.env`
2. Restart the development server after changing `.env`
3. Check that `builder.init()` is called with your API key
4. Verify components are registered with `builder.registerComponent()`

### API Errors

1. Make sure the backend is running on `http://localhost:3001`
2. Check that your Alpha Vantage API key is set in the backend
3. Be aware of API rate limits (5 requests/minute, 25/day)

### CORS Errors

The backend is configured to allow requests from `http://localhost:3000`. If you change the frontend port, update the backend's `.env` file.

## Resources

- [Builder.io Documentation](https://www.builder.io/c/docs/developers)
- [React Documentation](https://react.dev)
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)
