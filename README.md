<a name="readme-top"></a>

<h3 align="center">BizPortraits - AI Headshot Generator</h3>
<p align="center">
  <b><a href="https://bizportraits.com" >bizportraits.com</a></b>
  </p>
  <p align="center">
  An AI-powered headshot generator that transforms selfies into studio-quality portraits in seconds using Next.js, React, and Drizzle ORM, with Stripe integration for secure payments.
  </p>
</div>

<!-- ABOUT THE PROJECT -->

[![Home Page Screenshot][home-screenshot]](https://bizportraits.com)

## About The Project

BizPortraits offers a fast, affordable, and customizable solution for obtaining professional headshots without the need for traditional photoshoots.

Users can upload a photo, select preferred styles, and receive a high-quality headshot suitable for various professional and personal uses.

### Key Features
* **AI-Powered Headshot Generation**: Upload selfies and receive a high-quality, AI-generated headshot.
* **Customization Options**: Choose from a range of backgrounds and settings to match your personal or professional brand.
* **Fast Turnaround**: Headshots are generated within seconds.
* **Professional Quality**: Studio-quality portraits suitable for LinkedIn, resumes, social media, and more.
* **Review & Download**: Browse through your generated headshots and download your favorites in high resolution.

### Additional Features
* **Authentication**: Secure user authentication with email/password signup and login.
* **Payment Integration**: Stripe integration for seamless payment processing.
* **Progress Tracking**: Track your headshot generation progress.
* **User Dashboard**: Manage your generated headshots and account from a centralized dashboard.
* **Type Safety**: End-to-end type safety with TypeScript, RPC, and typed database queries.

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these steps

### Prerequisites

#### 1. **Database Setup:** 
Set up an SQLite database using one of the following methods:

- **Option A:** Create a new SQLite (libSQL) database on [Turso](https://turso.tech/)
- **Option B:** Use a local file in the db client: 'file:mydatabase.db'

#### 2. **Stripe Setup:** 
Create an account on [Stripe](https://stripe.com/) and obtain your API keys

#### 3. **AI Service Setup:**
Set up your AI inference service for headshot generation (e.g., Replicate or similar)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/columk1/headshot-generator.git
   ```
2. Install NPM packages
   ```sh
   pnpm install
   ```
3. Set up .env file using `.env.example` for reference

4. Run database migrations
   ```sh
   pnpm db:migrate
   ```
5. Seed the database with a default user
   ```sh
   pnpm db:seed
   ```
   This will create the following user:
   - User: `test@test.com`
   - Password: `admin123`

6. Start the development server
   ```sh
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

7. (Optional) Listen for Stripe webhooks locally
   ```sh
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

<!-- CONTACT -->

## Contact

Email: columk1@gmail.com  
Bluesky: [@columk.bsky.social](https://bsky.app/profile/columk.bsky.social)  
Website: [columkelly.com](https://columkelly.com)

Live Project Link: [bizportraits.com](https://bizportraits.com)

[home-screenshot]: ./public/images/home-screenshot.webp
