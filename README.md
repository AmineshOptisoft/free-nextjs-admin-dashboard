# Kandi - E-bike Delivery Admin Panel (UI Only)

Kandi is a production-ready Admin Panel UI for an E-bike Delivery Management System, built by customizing the TailAdmin Next.js dashboard.

## Features

- **Dashboard**: Real-time metrics for Total Orders, Active Deliveries, Completed Orders, and Available Riders. Includes delivery trend charts and recent activity feed.
- **Orders Module**:
  - **Orders List**: Comprehensive table with status filters and date range selection.
  - **Create Order**: Form for manual order entry with customer details, pickup/delivery addresses, and payment types.
  - **Order Details**: Detailed view of orders including assignment data, delivery paths, and a status timeline.
- **Rider Management**:
  - **Rider List**: Manage your delivery fleet with status tracking (Available, Busy, Offline).
  - **Add Rider**: Quick onboarding form for new riders and vehicles.
- **Tracking**: Live delivery tracking interface with map placeholders and active rider status panels.
- **Reports**: Analytics dashboard with delivery performance charts, completion rates, and export capabilities.
- **Notifications**: Tailored notification system for new orders, rider assignments, and completed deliveries.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS V4
- **Language**: TypeScript
- **Design Base**: TailAdmin (Customized)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open the browser**:
   Navigate to `http://localhost:3000` to view the dashboard.

## Key Customizations

- **Branding**: Updated all logos and brand marks to "Kandi".
- **Navigation**: Simplified sidebar to focus exclusively on delivery management.
- **Components**: Modified table schemas, form fields, and chart data to reflect E-bike delivery logic.
- **Mock Data**: All features use realistic static data for UI demonstration.

---
*Built for the Kandi E-bike Delivery Management System.*
