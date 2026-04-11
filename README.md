# CCTV Access Management Portal

## Overview
The CCTV Access Management Portal is a comprehensive, secure platform designed to seamlessly connect CCTV camera owners with citizens and law enforcement. It facilitates smooth requesting, sharing, and management of CCTV security footage, ensuring privacy and ease of access.

## Key Features
- **Role-Based Access**: Dedicated dashboards tailored for Citizens, CCTV Owners, and Administrators.
- **Interactive Maps**: Locate and select cameras based on geographic map clusters using Leaflet for precise search.
- **Footage Request System**: Citizens can request incident footage seamlessly.
- **Owner Monetization**: Owners can be compensated for providing public security footage through Razorpay micropayments.
- **Automated Privacy Protection**: Built-in real-time face blurring using `face-api.js` to protect bystanders' privacy before sharing.
- **Highly Secure Storage**: Footage is securely stored, and access is managed via expiring signed URLs backed by Firebase Cloud Functions.

## Tech Stack
- **Frontend Framework**: React 19 + Vite
- **Styling**: Vanilla CSS with a sleek, dark-themed "Lovable UI" design system
- **Routing**: React Router DOM v7
- **Maps**: Leaflet & React Leaflet
- **Backend Services**: Firebase (Authentication, Firestore Database, Cloud Storage)
- **Serverless Compute**: Firebase Cloud Functions
- **Payments**: Razorpay Node SDK

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nupoor-Deshpande01/CCTV-Access-Management-Portal.git
   cd CCTV-Access-Management-Portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY="your_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Deployment
This project is configured for seamless deployment on Vercel. A `vercel.json` file is included to properly route all client-side requests to `index.html` (resolving 404/blank screen errors on Single Page Applications).

When deploying to Vercel, simply ensure that your Firebase Environment Variables are mapped exactly as they appear in your `.env` within the Vercel Project Settings.
