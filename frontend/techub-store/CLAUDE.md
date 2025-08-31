# TechHub - React E-commerce Store

## Project Overview
TechHub is an electronics e-commerce store built with React + TypeScript to showcase modern frontend development skills. This is a learning project focusing on React fundamentals and best practices.

## Tech Stack
- **Frontend**: React 19.1.1 + TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **Styling**: TailwindCSS 4.1.12
- **Testing**: Vitest 3.2.4 + React Testing Library
- **Icons**: Lucide React
- **Routing**: React Router DOM (to be added)
- **State Management**: Zustand (to be added)
- **Forms**: React Hook Form (to be added)

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks  
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── data/          # Mock data files
├── styles/        # Global styles
└── assets/        # Static assets
```

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
npm run test       # Run tests (when added)
```

## Project Phases

### Phase 1 - Basic Structure ✅ COMPLETED
- [x] Project setup with Vite + React + TypeScript
- [x] TailwindCSS integration
- [x] Product grid component
- [x] Basic navigation header
- [x] Product card components
- [x] API data integration (Platzi Fake Store API)

### Phase 2 - Core Features ✅ COMPLETED
- [x] React Router setup for navigation
- [x] Product detail pages
- [x] Shopping cart functionality (Zustand + localStorage)
- [x] Cart page with quantity controls and totals
- [x] Header cart counter integration
- [ ] Search and category filtering
- [ ] Responsive design implementation

### Phase 3 - Polish
- [ ] User reviews/ratings display
- [ ] Wishlist functionality  
- [ ] Checkout form
- [ ] Loading states and error handling
- [ ] Toast notifications

## Data Source
Using **Platzi Fake Store API** for realistic product data:
- **API URL**: https://fakeapi.platzi.com/en/rest/products/
- **Documentation**: https://fakeapi.platzi.com/en/rest/products/

### Sample Product Schema
```json
{
  "id": 1,
  "title": "iPhone 9",
  "price": 549,
  "description": "An apple mobile which is nothing like apple",
  "images": [
    "https://i.imgur.com/QlRphfQ.jpg",
    "https://i.imgur.com/NjfRydJ.jpg",
    "https://i.imgur.com/mp3rUty.jpg"
  ],
  "creationAt": "2023-10-12T10:30:00.000Z",
  "updatedAt": "2023-10-12T10:30:00.000Z",
  "category": {
    "id": 2,
    "name": "Electronics",
    "image": "https://i.imgur.com/ZANVnHE.jpeg",
    "creationAt": "2023-10-12T10:30:00.000Z",
    "updatedAt": "2023-10-12T10:30:00.000Z"
  }
}
```

### TypeScript Product Interface
```typescript
interface Category {
  id: number;
  name: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  creationAt: string;
  updatedAt: string;
  category: Category;
}
```

## Learning Goals
- React component architecture
- State management (useState, useEffect)
- TypeScript integration
- Routing with React Router
- Form handling
- Responsive design with Tailwind
- Testing with Vitest

## Current Focus
Building the foundation components and setting up mock data for the product catalog. User is at basic React level and wants hands-on practice.

## Notes for Claude Code
- User prefers to run commands themselves for practice
- Focus on explaining concepts while coding
- Break down complex features into manageable steps
- Emphasize React best practices and clean code
- User has prior Tailwind experience
- Mock data approach (no backend integration needed)