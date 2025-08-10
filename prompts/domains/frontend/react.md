---
version: 1.0.0
frameworks: react, react-dom, next.js, gatsby
tools: webpack, vite, babel, eslint, prettier
created: 2025-08-10
updated: 2025-08-10
---

# React Domain Prompt Template

## Base Prompt
You are working with a React application. Apply React best practices and modern patterns to ensure clean, maintainable, and performant code.

## Best Practices
- Use functional components with hooks instead of class components
- Implement proper state management (useState, useReducer, Context API, or external libraries)
- Follow the principle of lifting state up when needed
- Use custom hooks to extract and reuse component logic
- Implement proper error boundaries for error handling
- Optimize re-renders with React.memo, useMemo, and useCallback
- Use proper key props in lists for efficient reconciliation
- Follow component composition over inheritance
- Implement code splitting with React.lazy and Suspense
- Use proper TypeScript types for props and state
- Follow naming conventions (PascalCase for components, camelCase for functions)
- Keep components small and focused on a single responsibility
- Use proper folder structure (components/, hooks/, utils/, services/)
- Implement proper testing with React Testing Library
- Use semantic HTML elements for accessibility

## Anti-Patterns
- Mutating state directly instead of creating new state objects
- Using array indexes as keys in dynamic lists
- Excessive prop drilling (use Context or state management instead)
- Using useEffect without proper cleanup functions
- Creating inline functions in render that cause unnecessary re-renders
- Not handling loading and error states properly
- Using document.querySelector instead of refs
- Mixing business logic with presentation logic
- Creating overly complex components that do too much
- Not memoizing expensive calculations
- Using any type in TypeScript instead of proper types
- Ignoring React DevTools warnings and errors
- Not following React's rules of hooks
- Using deprecated lifecycle methods in new code

## Context Requirements
- React version and related dependencies
- State management solution (Context, Redux, Zustand, etc.)
- Routing solution (React Router, Next.js routing, etc.)
- Build tool configuration (Create React App, Vite, Next.js, etc.)
- Component library or design system being used
- Testing framework setup
- TypeScript configuration if applicable
- CSS solution (CSS Modules, styled-components, Tailwind, etc.)
- Performance requirements and constraints
- Browser compatibility requirements
- Accessibility standards to follow (WCAG level)
- Internationalization requirements if any

## Common Patterns

### Custom Hook Pattern
```javascript
function useCustomHook(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  const customLogic = useCallback(() => {
    // Hook logic here
  }, [dependencies]);
  
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  return { value, customLogic };
}
```

### Error Boundary Pattern
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Performance Optimization Pattern
```javascript
const OptimizedComponent = React.memo(({ data, onAction }) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  const handleAction = useCallback((item) => {
    onAction(item);
  }, [onAction]);
  
  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} onClick={() => handleAction(item)} />
      ))}
    </div>
  );
});
```

## Framework-Specific Guidelines

### Next.js
- Use Server Components where appropriate (React 18+)
- Implement proper data fetching strategies (SSR, SSG, ISR)
- Optimize images with next/image component
- Use API routes for backend functionality
- Configure proper caching headers

### Create React App
- Follow the prescribed folder structure
- Use environment variables properly (.env files)
- Optimize build size with code splitting
- Configure proxy for API calls in development

### Vite
- Leverage fast HMR for development
- Use proper module imports for tree shaking
- Configure aliases for cleaner imports
- Optimize build with rollup plugins