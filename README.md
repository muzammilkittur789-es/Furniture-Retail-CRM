# Furniture Retail CRM & Showroom Operating System

A digital showroom operating system designed for luxury furniture retail stores and showrooms (such as **Alishan Furnitures**).

## Key Features

- **Sales Terminal (`/sales`)**:
  - 4-digit PIN authentication for sales team members and owner.
  - Interactive catalogue with category filtering and real-time stock availability.
  - Multi-item quote builder with custom discounts (% and flat ₹).
  - Mandatory customer lead capture (Name & 10-digit WhatsApp number).
  - 24-hour product locking to prevent double-quotation collisions.
  - 1-click official branded PDF generation and direct WhatsApp dispatch.

- **Direct WhatsApp PDF Quotations**:
  - Client-side high-resolution PDF generator built with `pdf-lib`.
  - Official vector Indian Rupee (`₹`) typography aligned with currency figures.
  - Customer name attribution, salesperson details, item thumbnails, dimensions, and financial breakdown.
  - 24-hour price validity notice and showroom contact details.

- **Admin & Owner Dashboard (`/admin`)**:
  - Dynamic salesperson lead attribution and live follow-up tracker.
  - Morning follow-ups manager with 1-click WhatsApp messaging and calling.
  - Inventory management (toggle active/sold-out status, add products).
  - Salesperson staff management (add/edit salesmen, update PINs).
  - Performance analytics and revenue tracking.

- **Web Quotation Document (`/quote/[id]`)**:
  - Customer-facing digital quotation page with WhatsApp booking confirmation.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Engine**: `pdf-lib` (Vector graphics & custom layout)
- **Database / Backend**: Supabase + In-Memory Fallback Store for offline demo
