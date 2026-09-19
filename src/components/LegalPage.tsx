import React from 'react';
import { Logo } from './Logo';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#111111] font-sans">
      <header className="sticky top-0 z-40 bg-[#F5F7FA]/90 backdrop-blur-md border-b border-[#E2E6EC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="cursor-pointer" onClick={onBack}>
            <Logo layout="horizontal" size={28} />
          </div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-gray-500 hover:text-[#111111] transition-colors bg-transparent border-none cursor-pointer"
          >
            ← Back to Website
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        {type === 'privacy' ? <PrivacyContent /> : <TermsContent />}
      </main>
    </div>
  );
};

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-extrabold text-[#111111] pt-2">{children}</h2>
);
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
);
const UL: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="text-sm text-gray-600 leading-relaxed list-disc pl-5 space-y-1.5">
    {items.map((it, i) => <li key={i}>{it}</li>)}
  </ul>
);

const PrivacyContent: React.FC = () => (
  <>
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">Privacy Policy</h1>
      <p className="text-xs text-gray-400 font-mono">Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <P>
      CaptionDrive ("we", "us") provides a tool that turns photos and videos you already have into
      social media captions. This page explains what we collect, why, and how you can control it.
    </P>

    <H2>What we collect</H2>
    <UL items={[
      'Account information: your name and email address when you sign up.',
      "Google Drive access: with your permission, read-only access to view and open photos and videos in your Drive so you can generate captions for them. We do not modify, delete, or move your Drive files.",
      'Instagram access: if you choose to connect an Instagram account, permission to read basic account info, publish posts on your behalf, and read engagement metrics for posts published through CaptionDrive.',
      'Content you create: captions, brand voice settings, and scheduling choices you make inside CaptionDrive.',
    ]} />

    <H2>How we use it</H2>
    <UL items={[
      'To generate captions from your media using AI (Google Gemini).',
      'To publish or schedule posts to social accounts you connect, only when you choose to.',
      'To show you your own caption history, scheduled posts, and (where connected) post performance.',
      'To operate, maintain, and improve CaptionDrive.',
    ]} />

    <H2>What we don't do</H2>
    <UL items={[
      "We don't sell your data.",
      "We don't post anything without your action — publishing and scheduling are things you explicitly trigger.",
      "We don't access Drive files or folders you haven't chosen to bring into CaptionDrive.",
    ]} />

    <H2>Third parties involved</H2>
    <P>
      CaptionDrive relies on a small number of third-party services to work: Google (Drive access,
      sign-in), Google Gemini (caption generation), Meta/Instagram Graph API (publishing and
      insights for connected accounts), and our hosting and database providers. Each handles data
      under their own privacy terms.
    </P>

    <H2>Your choices</H2>
    <UL items={[
      'Disconnect Google Drive or Instagram at any time from Settings — this revokes our access immediately.',
      'Delete your account and associated data by contacting us at the email below.',
      'Ask us what data we hold about you at any time.',
    ]} />

    <H2>Contact</H2>
    <P>Questions about this policy or your data: hello@captiondrive.app</P>

    <div className="pt-6 mt-6 border-t border-[#E2E6EC]">
      <p className="text-xs text-gray-400 leading-relaxed">
        This is a plain-language summary intended to be genuinely accurate about how CaptionDrive works today. It has not been reviewed by a lawyer — if you need this to meet a specific legal or regulatory requirement, have it reviewed before relying on it.
      </p>
    </div>
  </>
);

const TermsContent: React.FC = () => (
  <>
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-black text-[#111111] tracking-tight">Terms of Service</h1>
      <p className="text-xs text-gray-400 font-mono">Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <P>
      These terms cover your use of CaptionDrive. By creating an account, you agree to them.
    </P>

    <H2>Using CaptionDrive</H2>
    <UL items={[
      'You must be able to form a binding agreement (generally 18+, or the age of majority where you live) to use CaptionDrive.',
      "You're responsible for what you publish through CaptionDrive to your connected accounts — we generate suggestions, but you choose what goes live.",
      'You agree not to use CaptionDrive to generate or publish content that is illegal, harassing, or violates the terms of the platforms you connect (e.g. Instagram).',
      "You're responsible for keeping your login credentials secure.",
    ]} />

    <H2>Your content</H2>
    <P>
      You own the photos, videos, and captions you bring into or create with CaptionDrive. We only
      access and process them to provide the service to you — to generate captions, and to publish
      or schedule posts you approve.
    </P>

    <H2>Connected accounts</H2>
    <P>
      Connecting Google Drive or Instagram grants CaptionDrive the specific permissions described
      during that connection flow. You can revoke access at any time from Settings; doing so stops
      CaptionDrive from acting on that account going forward.
    </P>

    <H2>Plans and billing</H2>
    <P>
      CaptionDrive offers a free plan and paid plans with higher usage limits, billed monthly. You
      can cancel a paid plan at any time; your plan remains active until the end of the current
      billing period.
    </P>

    <H2>Service availability</H2>
    <P>
      We aim to keep CaptionDrive available and reliable, but we don't guarantee uninterrupted
      access — features depend in part on third-party services (Google, Meta, Gemini) that are
      outside our control.
    </P>

    <H2>Termination</H2>
    <P>
      You can stop using CaptionDrive and delete your account at any time. We may suspend or
      terminate accounts that violate these terms or misuse the service.
    </P>

    <H2>Contact</H2>
    <P>Questions about these terms: hello@captiondrive.app</P>

    <div className="pt-6 mt-6 border-t border-[#E2E6EC]">
      <p className="text-xs text-gray-400 leading-relaxed">
        This is a plain-language summary intended to be genuinely accurate about how CaptionDrive works today. It has not been reviewed by a lawyer — if you need this to meet a specific legal or regulatory requirement, have it reviewed before relying on it.
      </p>
    </div>
  </>
);
