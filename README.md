# OX Vito Clothing Brand Website

A clean, white aesthetic website for OX Vito clothing brand built with Next.js, TypeScript, and Tailwind CSS. The site connects to an Airtable database to fetch product details and allows users to order products directly via WhatsApp.

## Features

- Clean white design
- Product catalog fetched from Airtable
- WhatsApp integration for ordering
- Responsive layout
- Built with Next.js 16 and App Router

## Getting Started

### Prerequisites

- Node.js (installed)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd ox-vito
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your Airtable credentials:
   ```
   AIRTABLE_API_KEY=your_airtable_api_key
   AIRTABLE_BASE_ID=your_base_id
   WHATSAPP_PHONE_NUMBER=your_whatsapp_number
   ```

4. Configure Airtable:
   - Create a base with a table named 'Products'
   - Add fields: Name (text), Price (number), Description (text), Image (attachment or URL)

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the website.

## Build

```bash
npm run build
```

## Deployment

Deploy to Vercel, Netlify, or any platform supporting Next.js.

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Airtable API
