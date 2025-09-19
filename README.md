# Snift Mobile App

A React Native mobile app for the Snift dating platform, built with Expo and TypeScript.

## Features

- **Photo-free dating** - Character-based matching
- **Real-time chat** - Socket.IO integration
- **Connection requests** - Send personalized messages
- **Subscription packs** - Razorpay payment integration
- **Responsive design** - Mobile-first approach
- **TypeScript** - Full type safety
- **NativeWind** - Tailwind CSS for React Native

## Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation 6
- **Styling:** NativeWind (Tailwind CSS)
- **State Management:** React Query (TanStack Query)
- **Real-time:** Socket.IO
- **Storage:** AsyncStorage
- **HTTP Client:** Axios
- **Validation:** Zod

## Project Structure

```
src/
├── api/                 # API services and types
│   ├── config.ts       # Axios configuration
│   ├── types.ts        # TypeScript interfaces
│   ├── auth.ts         # Authentication API
│   ├── profiles.ts     # Profiles and discovery API
│   ├── chat.ts         # Chat API
│   └── payments.ts     # Payment API
├── components/         # Reusable components
│   └── TabBarIcon.tsx  # Tab bar icon component
├── hooks/              # Custom hooks
│   ├── useAuth.ts      # Authentication hook
│   └── useSocket.ts    # Socket.IO hook
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── MatchesScreen.tsx
│   ├── RequestsScreen.tsx
│   ├── ChatScreen.tsx
│   ├── PacksScreen.tsx
│   └── ProfileScreen.tsx
├── styles/             # Theme and styling
│   └── theme.ts        # Design system theme
└── utils/              # Utility functions
    └── queryClient.ts  # React Query configuration
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd snift-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=https://thesnift.com
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on specific platforms:**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

## Design System

The app uses a design system that mirrors the web application:

### Colors
- **Primary:** #8A4B2A (brand-accent)
- **Background:** #F7F3EC (page-background)
- **Card:** #FAF7F3 (card-paper)
- **Text:** #1F2937 (primary-text)
- **Muted:** #5B6068 (secondary-text)

### Typography
- **Headings:** Poppins font family
- **Body:** Lato font family

### Spacing
- Consistent spacing scale from 0.5 to 96
- Mobile-first responsive design

## API Integration

The app integrates with the existing Snift backend API:

- **Base URL:** `https://thesnift.com`
- **Authentication:** JWT tokens with AsyncStorage
- **Real-time:** Socket.IO for chat and notifications
- **Payments:** Razorpay integration

## Key Features

### Authentication
- Login with credentials
- Registration with profile creation
- JWT token management
- Automatic token refresh

### Discovery
- Browse user profiles
- Send connection requests
- View incoming requests
- Accept/decline requests

### Chat
- Real-time messaging
- Message history
- Socket.IO integration
- Typing indicators

### Payments
- Subscription pack management
- Razorpay payment integration
- QR code payments
- Payment history

## Development

### Code Style
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Consistent naming conventions
- Component-based architecture

### Testing
- Unit tests with Jest
- Component tests with React Native Testing Library
- E2E tests with Detox (planned)

### Building for Production

1. **Configure EAS Build:**
   ```bash
   npx eas build:configure
   ```

2. **Build for iOS:**
   ```bash
   npx eas build --platform ios
   ```

3. **Build for Android:**
   ```bash
   npx eas build --platform android
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary and confidential.