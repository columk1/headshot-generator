<a name="readme-top"></a>

<h3 align="center">BizPortraits - AI Headshot Generator</h3>
<p align="center">
  <b><a href="https://bizportraits.com" >bizportraits.com</a></b>
  </p>
  <p align="center">
  An AI-powered headshot generator that transforms selfies into studio-quality portraits in seconds using Next.js, React and Drizzle ORM.
  </p>
</div>

<!-- ABOUT THE PROJECT -->

[![Home Page Screenshot][home-screenshot]](https://bizportraits.com)

## About The Project

BizPortraits is a leading AI-powered headshot generator that simplifies the process of obtaining professional headshots by leveraging advanced AI algorithms. Trusted by many professionals and teams, BizPortraits offers a fast, affordable, and customizable solution for obtaining professional headshots without the need for traditional photoshoots.

Users can upload a few photos, select preferred styles, and receive a set of high-quality headshots suitable for various professional and personal uses.

### Key Features
* **AI-Powered Headshot Generation**: Upload selfies and receive 5 high-quality, AI-generated headshots in various styles and settings.
* **Customization Options**: Choose from a wide range of outfits, backgrounds, and poses to match your personal or professional brand.
* **Fast Turnaround**: Receive your AI-generated headshots within minutes, saving time compared to traditional photoshoots.
* **Privacy and Security**: BizPortraits prioritizes user privacy, ensuring that your data is handled with the utmost care.
* **Professional Quality**: Studio-quality portraits suitable for LinkedIn, resumes, social media, and more.

### Additional Features
* **Authentication**: Secure user authentication with email/password signup and login.
* **Payment Integration**: Stripe integration for seamless payment processing.
* **Real-time Status**: Track your headshot generation progress in real-time.
* **High-Resolution Downloads**: Download your favorite headshots in high resolution.
* **User Dashboard**: Manage your generated headshots and account from a centralized dashboard.
* **Type Safety**: TypeScript throughout the entire application for robust type safety.
* **Modern UI**: Beautiful and responsive interface built with shadcn/ui components and Tailwind CSS.

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
Set up your AI service for headshot generation (e.g., Replicate or similar)

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

## Going to Production

When you're ready to deploy your application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `DATABASE_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

<!-- CONTACT -->

## Contact

Email: columk1@gmail.com  
Bluesky: [@columk.bsky.social](https://bsky.app/profile/columk.bsky.social)  
Website: [columkelly.com](https://columkelly.com)

Live Project Link: [bizportraits.com](https://bizportraits.com)

[home-screenshot]: ./public/images/home-screenshot.webp
