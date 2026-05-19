# Frontend File Map

Root: frontend/Lock-n-More-Admin-FE-

## Root App Files
- index.html: Vite HTML shell.
- index.tsx: React mount entrypoint.
- App.tsx: Main app composition, routing, app context, and state orchestration.
- types.ts: Shared frontend type definitions.
- i18n.ts: Translation dictionaries and language keys.
- package.json: Frontend dependencies and Vite scripts.
- tsconfig.json: TypeScript config for frontend.
- vite.config.ts: Vite config and GEMINI API key define mapping.
- vercel.json: Vercel deployment routing/build settings.
- metadata.json: Project metadata.
- README.md: Product/vision level frontend readme.

## Components
- components/Header.tsx: Top header bar and global actions.
- components/Sidebar.tsx: Main navigation and route menu.
- components/Icons.tsx: Shared icon wrappers/components.

## Pages
- pages/Login.tsx: Authentication UI.
- pages/Dashboard.tsx: System overview dashboard.
- pages/Inbox.tsx: Multi-channel conversation workspace.
- pages/Products.tsx: Product listing and management view.
- pages/Orders.tsx: Orders and commerce state view.
- pages/AIManager.tsx: AI behavior/tone control UI.
- pages/Analytics.tsx: Metrics and KPI visualization.
- pages/Settings.tsx: Integration/system settings UI.
- pages/UserManagement.tsx: Staff and role management UI.
- pages/Documentation.tsx: In-app visual documentation/proposal page.

## Services
- services/db.ts: LocalStorage state persistence and default seed data.
- services/gemini.ts: Gemini API integration for AI suggestions in frontend simulation path.

## Frontend Behavior Summary
- Uses HashRouter for route navigation.
- Uses centralized app context from App.tsx for major state and actions.
- Includes simulated operational behaviors (notifications, lead simulation, AI auto-reply flow) through local state services.
