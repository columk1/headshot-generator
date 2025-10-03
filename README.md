# BizPortraits.com

**BizPortraits** is a leading AI-powered headshot generator that transforms your selfies into studio-quality portraits in seconds. Trusted by many professionals and teams, BizPortraits offers a fast, affordable, and customizable solution for obtaining professional headshots without the need for traditional photoshoots.

---

## Overview

BizPortraits simplifies the process of obtaining professional headshots by leveraging advanced AI algorithms. Users can upload a few photos, select preferred styles, and receive a set of high-quality headshots suitable for various professional and personal uses.

---

## Features

- 🎯 **AI-Powered Headshot Generation**: Upload selfies and receive 5 high-quality, AI-generated headshots in various styles and settings.

- 🎨 **Customization Options**: Choose from a wide range of outfits, backgrounds, and poses to match your personal or professional brand.

- ⏱️ **Fast Turnaround**: Receive your AI-generated headshots within minutes, saving time compared to traditional photoshoots.

- 🛡️ **Privacy and Security**: BizPortraits prioritizes user privacy, ensuring that your data is handled with the utmost care.

## User Flows

### 1. **Sign Up / Log In**

- Sign up using your email address or log in to your existing account.

### 2. **Upload Photos**

- Upload a single high-quality selfie. Ensure good lighting and clear facial visibility for optimal results.

### 3. **Select Styles**

- Choose your preferred attire and backgrounds from a curated selection to match your desired look.

### 4. **AI Processing**

- Our AI model processes your photos to generate a personalized set of headshots.

### 5. **Review**

- Browse through your generated headshots.

### 6. **Download and Use**

- Download your favorite headshots in high resolution.
- Use them for professional profiles, resumes, social media, and more.

---

## Getting Started

1. **Visit BizPortraits**: Navigate to https://bizportraits.com.

2. **Create an Account**: Sign up with your email address.

3. **Upload Photos**: Provide at least 1 high-quality selfie.

4. **Customize**: Select your preferred styles and backgrounds.

5. **Generate Headshots**: Let the AI process your photos.

6. **Download**: Access and download your new professional headshots.

---

## Pricing

BizPortraits offers various pricing tiers to accommodate different needs:

- **Basic Package**: Starting at $10, includes a set of AI-generated headshots.

For detailed pricing information, visit the [Pricing Page](https://bizportraits.com/pricing).

---

## License

All rights reserved by BizPortraits. Unauthorized use or distribution of the platform's content and services is prohibited.



## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [SQLite](https://www.sqlite.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/columk1/headshot-generator.git
cd headshot-generator
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Then, run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can, of course, create new users as well through `/sign-up`.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

Optionally, you can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

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
4. `DATABASE_URL`: Set this to your production database URL (Turso libSQL).
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.
