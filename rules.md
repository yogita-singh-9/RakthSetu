# Project Rules and Guidelines

This document contains the rules, best practices, and guidelines for the technologies used in this project.

## 🎨 Tailwind CSS

- **Utility-First**: Strictly use Tailwind utility classes for all styling.
- **Avoid Custom CSS**: Minimize the use of custom CSS files. If you find yourself writing custom CSS frequently, consider updating the `tailwind.config.js` theme.
- **Configuration**: Extend colors, fonts, and spacing in `tailwind.config.js` to maintain a consistent design system.
- **Component Reusability**: Extract highly repetitive utility combinations into reusable React components rather than `@apply` directives, unless necessary.

## 🐻 Zustand

- **Global State**: Use Zustand for managing global application state that needs to be accessed across multiple distant components.
- **Modular Stores**: Create separate stores for different domains or features (e.g., `useAuthStore`, `useUserStore`, `useSettingsStore`) to keep things organized.
- **Selectors**: Always use selectors when extracting state from the store in your components to prevent unnecessary re-renders (e.g., `const user = useAuthStore((state) => state.user)`).
- **Actions in Store**: Keep the state-modifying actions inside the store definition itself alongside the state.

## 🔥 Firebase Database (Firestore)

- **Initialization**: Keep the Firebase initialization and configuration logic centralized in a dedicated utility file.
- **Data Access Layer**: Create modular functions, custom hooks, or service classes for interacting with Firestore to abstract the database logic away from UI components.
- **Collections & Documents**: Structure data logically into Collections and sub-collections. Avoid deeply nested sub-collections where possible for easier querying.
- **Security Rules**: Always implement and test Firestore Security Rules to ensure that users can only read and write data they are authorized to access.
- **State Sync**: When integrating with Zustand, you can set up real-time listeners (`onSnapshot`) at a high level or inside specific hooks and sync the incoming data to the Zustand store.

## ❇️ Lucide React (Icons)

- **Icons over Emojis**: Always use `lucide-react` components for standard icons rather than system emojis to maintain a professional, customizable, and consistent design across all devices.
- **Styling**: Size and color icons using Tailwind CSS classes passed to the `className` prop for seamless integration with your design system.

## 🎬 Framer Motion (Animations)

- **Purposeful Animations**: Use `framer-motion` to add fluid animations, page transitions, and micro-interactions to make the user interface more dynamic and engaging.
- **Performance**: Always prefer animating `transform` (e.g., `x`, `y`, `scale`) and `opacity` to ensure smooth 60fps animations, rather than animating layout properties like `width` or `top`.

## 🏗️ Component Architecture & Organization

- **Universal Reusable Components**: Place components used across multiple roles or features in `frontend/src/components`.
- **Role-Based Components**: Place role-specific reusable components in a `components` sub-folder within the role's directory (e.g., `frontend/src/User/components`, `frontend/src/Admin/components`).
- **Maximum Reusability**: Break down large files into smaller, reusable components. If a piece of UI is used more than once, or if a component becomes too large (e.g., > 200 lines), extract sub-components to improve readability and maintainability.
- **Folder Structure**: Each major feature or role should have its own dedicated folder to keep the `src` directory clean.

---

*(More rules and guidelines will be added here later)*
