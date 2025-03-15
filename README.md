# DataHub - Frontend Architecture

A modern React application for managing datasets with features like authentication, dataset creation, viewing, and searching.

## Project Structure

The project follows a Feature-Based Architecture combined with Atomic Design principles for components:

```
src/
├── assets/            # Static assets like images, icons, etc.
│   ├── icons/
│   └── images/
├── components/        # Shared/reusable components
│   ├── layout/        # Layout components (Navbar, Sidebar, etc.)
│   └── ui/            # UI components (Button, Input, etc.)
├── context/           # React Context for global state management
├── features/          # Feature-based modules
│   ├── auth/          # Authentication feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── AuthRoutes.tsx
│   └── datasets/      # Datasets feature
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       └── DatasetRoutes.tsx
├── hooks/             # Custom hooks
├── services/          # API services
├── styles/            # Global styles and component-specific styles
│   ├── components/
│   └── features/
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Features

- **Authentication**: Login, Register, Forgot Password
- **Datasets Management**: Create, View, Search, Edit, Delete
- **Responsive Design**: Works on desktop and mobile devices
- **Type Safety**: Full TypeScript support

## Tech Stack

- **React**: UI library
- **TypeScript**: Type safety
- **React Router**: Routing
- **Axios**: HTTP client
- **Vite**: Build tool
- **Vitest**: Testing framework
- **ESLint & Prettier**: Code quality
- **Husky & lint-staged**: Git hooks

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/datahub-frontend.git
cd datahub-frontend

# Install dependencies
npm install
# or
yarn install
```

### Running the app

```bash
# Development mode
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build
```

### Testing

```bash
# Run tests
npm test
# or
yarn test

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage
```

## Best Practices

- **Component Organization**: Follow Atomic Design principles
- **State Management**: Use React Context for global state, local state for component-specific state
- **API Calls**: Centralize in service modules
- **Styling**: Use CSS modules or styled-components for component-specific styles
- **Testing**: Write tests for components, hooks, and utilities
- **Code Quality**: Follow ESLint and Prettier rules

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
