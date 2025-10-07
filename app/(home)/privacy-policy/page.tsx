import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | BizPortraits",
  description: "Learn how BizPortraits collects, uses, and protects your personal data for AI-generated headshots.",
};

export default function PrivacyPage(): ReactElement {
  const lastUpdated: string = "October 2, 2025";

  return (
    <main className="container mx-auto flex max-w-4xl flex-col gap-12 px-4 py-16 md:px-6">
      <header className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-base text-muted-foreground">
          BizPortraits ("we", "our", or "us") respects your privacy. This policy explains what personal data we
          collect when you use our AI-powered headshot generator, how we use it, and the choices you have in line with
          the EU General Data Protection Regulation (GDPR).
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Personal data we collect</h2>
        <p className="text-base text-muted-foreground">
          We collect only the data necessary to deliver professional headshots and support your account.
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Account details:</span> name, email address, and authentication
            data when you create or sign in to your account.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Payment information:</span> billing details and payment intent
            identifiers processed securely by Stripe. We do not store card numbers.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Source images:</span> photos you upload so our models can
            generate enhanced headshots.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Generated images:</span> AI-generated headshots we create for
            you.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Usage data:</span> device information, browser settings, IP
            address, and site interactions captured through analytics and error logging to improve reliability. We use privacy-first analytics that do not set cookies or track individual users.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">How we use personal data</h2>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Headshot generation:</span> We process uploaded photos to
            deliver the requested results. Legal basis: performance of our contract with you.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Storage and account management:</span> We store your generated
            results so you can access them. You can delete them at any time by deleting your account. Legal basis:
            performance of our contract and our legitimate interest in providing a functional service.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Payments and fraud prevention:</span> We process payment
            details and transaction records to complete purchases and prevent fraudulent activity. Legal basis: legal
            obligation and our legitimate interests in secure transactions.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Support communications:</span> We use your contact details to
            respond to inquiries and provide updates about your account or service usage. Legal basis: performance of our
            contract and our legitimate interests in customer support.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Product improvement (analytics):</span> We analyze aggregated,
            non-identifiable usage statistics to enhance features and service quality. Legal basis: legitimate interests.
            If we ever use identifiable personal data for product improvement (for example, training new models), we will
            first obtain your explicit consent.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Security and compliance:</span> We monitor for abuse,
            unauthorized access, and policy violations to protect our systems and comply with applicable laws. Legal
            basis: legal obligation and legitimate interests.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Data sharing and processors</h2>
        <p className="text-base text-muted-foreground">
          We share personal data only with trusted processors that help run our service:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Stripe:</span> payment processing and billing management. For EU/EEA users, some Stripe processing may occur outside the EU/EEA (for example, in the US). Stripe relies on Standard Contractual Clauses to ensure your data remains protected.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Hosting and storage providers:</span> secure infrastructure for the application and temporary image processing.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Analytics services:</span> aggregated usage insights to improve reliability. Analytics data is pseudonymized where possible.
          </li>
        </ul>
        <p className="text-base text-muted-foreground">
          We never sell your personal data. Where processors operate outside the EU/EEA, we rely on approved transfer mechanisms such as Standard Contractual Clauses. You may request more information about these safeguards by contacting us.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Data retention and deletion</h2>
        <p className="text-base text-muted-foreground">
          We store personal data only for as long as needed to provide the service or comply with legal obligations:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Source images:</span> deleted automatically within 24 hours after
            processing unless you request earlier deletion.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Generated headshots:</span> stored in your account until you delete them or your account.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Account and billing data:</span> retained while your account is
            active and for up to seven years to meet tax and accounting requirements.
          </li>
          <li className="text-base text-muted-foreground">
            <span className="font-medium text-foreground">Support communications:</span> retained for up to two years to
            help resolve follow-up requests.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Your GDPR rights</h2>
        <p className="text-base text-muted-foreground">
          As a data subject, you have the following rights regarding your personal data:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          <li className="text-base text-muted-foreground">Access and receive a copy of your personal data.</li>
          <li className="text-base text-muted-foreground">Request correction of inaccurate or incomplete data.</li>
          <li className="text-base text-muted-foreground">Request deletion of your data when no longer needed or withdrawn consent.</li>
          <li className="text-base text-muted-foreground">Restrict or object to processing based on legitimate interests.</li>
          <li className="text-base text-muted-foreground">Request data portability in a machine-readable format.</li>
          <li className="text-base text-muted-foreground">Withdraw consent at any time without affecting prior lawful processing.</li>
          <li className="text-base text-muted-foreground">Lodge a complaint with your local supervisory authority.</li>
        </ul>
        <p className="text-base text-muted-foreground">
          To exercise these rights, email us at <Link href="mailto:support@bizportraits.com" className="text-primary underline">support@bizportraits.com</Link>.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Security</h2>
        <p className="text-base text-muted-foreground">
          We implement technical and organizational measures to protect your data, including encryption in transit,
          hardened infrastructure, access controls, and regular security audits. While no system is perfectly secure, we
          continuously monitor for vulnerabilities and mitigate risks promptly.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Children&apos;s privacy</h2>
        <p className="text-base text-muted-foreground">
          BizPortraits is not intended for individuals under 18 years of age. We do not knowingly collect personal data
          from children. If you believe a child provided us with personal data, contact us so we can delete it.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="text-base text-muted-foreground">
          If you have questions about this policy or our data practices, reach out at
          <Link href="mailto:support@bizportraits.com" className="ml-1 text-primary underline">support@bizportraits.com</Link>.
        </p>
      </section>
    </main>
  );
}
