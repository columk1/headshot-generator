import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | BizPortraits",
  description: "Review the terms of service for using BizPortraits, including payment, AI usage, and user responsibilities.",
};

export default function TermsPage(): ReactElement {
  const lastUpdated: string = "October 2, 2025";

  return (
    <main className="container mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16 md:px-6">
      <header className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-base text-muted-foreground">
          These Terms of Service ("Terms") govern your use of BizPortraits ("we", "us", or "our") and the AI-powered
          headshot generation tools available at bizportraits.com (the "Service"). By accessing or using the Service,
          you agree to be bound by these Terms.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">1. Eligibility</h2>
        <p className="text-base text-muted-foreground">
          You must be at least 18 years old and capable of entering into a legally binding agreement to use the Service. By creating an account or purchasing a headshot, you confirm that you meet these requirements.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">2. Account registration</h2>
        <p className="text-base text-muted-foreground">
          To access certain features, you may need to register an account. You agree to provide accurate, current, and
          complete information and to maintain the security of your credentials. You are responsible for all activities
          that occur under your account.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">3. Services and deliverables</h2>
        <p className="text-base text-muted-foreground">
          BizPortraits uses generative AI to transform reference photos you upload into professional-looking headshots.
          The Service provides:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Single headshot:</span> Enhancements based on a single uploaded
            photo.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Custom AI model (coming soon):</span> Optional training using
            multiple images you provide to generate additional variations.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Performance:</span> Output quality depends on the clarity of
            the uploaded images. We aim to deliver results within minutes; however, processing times may vary due to
            system load and third-party dependencies.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">4. Payments and Refunds</h2>
        <p className="text-base text-muted-foreground">
          Payments are processed securely through Stripe. Prices are displayed in USD unless otherwise noted and are due at purchase.
        </p>
        <p className="text-base text-muted-foreground">
          We offer a <strong>satisfaction guarantee</strong>:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Refund request window:</span> Contact us within <strong>7 days</strong> of purchase to request a refund.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Refund eligibility:</span> Refunds are honored for purchases made within the last <strong>30 days</strong>.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Processing time:</span> Refunds are issued at our discretion and may take several business days to process.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Service access:</span> We may suspend or cancel access to the Service if payment is not received. All fees are otherwise non-refundable unless required by law.
          </li>
        </ul>
      </section>



      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">5. Acceptable use</h2>
        <p className="text-base text-muted-foreground">
          You agree not to upload content that violates intellectual property rights, privacy rights, or applicable laws.
          You will not:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Misrepresentation:</span> Submit images you do not own or have
            permission to use, or impersonate another person.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Model misuse:</span> Attempt to reverse engineer, decompile,
            or misuse our AI models.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Prohibited content:</span> Upload material that is harmful,
            hateful, or illegal.
          </li>
        </ul>
        <p className="text-base text-muted-foreground">
          We reserve the right to suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">6. Intellectual property</h2>
        <p className="text-base text-muted-foreground">
          BizPortraits retains all rights, title, and interest in the Service, including software, documentation, and AI
          models. Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable
          license to use the Service to generate headshots. You may download and use generated images for personal or
          professional purposes. You remain responsible for ensuring that your use of the output complies with applicable
          laws and platform policies.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">7. Data processing and privacy</h2>
        <p className="text-base text-muted-foreground">
          Our collection and use of personal data are described in our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
          By using the Service, you consent to the processing of your data as outlined therein.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">8. Warranties and disclaimers</h2>
        <p className="text-base text-muted-foreground">
          The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied,
          including implied warranties of merchantability, fitness for a particular purpose, accuracy, or non-infringement.
          We do not guarantee that generated headshots will meet your expectations or that the Service will be uninterrupted
          or error-free.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">9. Limitation of liability</h2>
        <p className="text-base text-muted-foreground">
          To the maximum extent permitted by law, BizPortraits and its affiliates are not liable for indirect, incidental,
          special, consequential, or punitive damages, or any loss of profits or data arising from your use of the Service.
          Our total liability for any claim will not exceed the amount you paid in the twelve months preceding the event
          giving rise to the claim.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">10. Indemnification</h2>
        <p className="text-base text-muted-foreground">
          You agree to indemnify and hold harmless BizPortraits, its directors, employees, and partners from any claims,
          damages, liabilities, and expenses arising from your use of the Service or violation of these Terms.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">11. Termination</h2>
        <p className="text-base text-muted-foreground">
          We may modify, suspend, or terminate the Service at any time with notice. You may stop using the Service at any
          time. Sections that by their nature should survive termination will remain in effect, including intellectual
          property, limitations of liability, and indemnification.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">12. Changes to these Terms</h2>
        <p className="text-base text-muted-foreground">
          We may update these Terms from time to time. Material changes will be communicated via email or prominent notice
          on the Service. Your continued use after the effective date constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className="flex flex-col gap-3 pb-4">
        <h2 className="text-2xl font-semibold">13. Contact</h2>
        <p className="text-base text-muted-foreground">
          For questions about these Terms, contact us at
          <Link href="mailto:legal@bizportraits.com" className="ml-1 text-primary underline">support@bizportraits.com</Link>.
        </p>
      </section>
    </main>
  );
}
