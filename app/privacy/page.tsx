import LegalPage, { LegalSection, LegalText } from "@/components/legal/LegalPage";

const NOTICE = (
  <>
    <span className="font-semibold text-ink">Heads-up:</span> this is a draft prepared for review.
    Before launch, Donate the Blood should have this policy reviewed by a qualified legal
    professional — we handle phone numbers, precise location coordinates, blood type, and
    identity documents.
  </>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="We collect the minimum needed to connect people with donors, we only share donor contact details with consent, and we never sell your data."
      notice={NOTICE}
      updated="September 2026"
      toc={[
        { id: "introduction", label: "Introduction" },
        { id: "what-we-collect", label: "Information we collect" },
        { id: "how-we-use", label: "How we use your information" },
        { id: "how-we-share", label: "How we share your information" },
        { id: "security", label: "Data security" },
        { id: "rights", label: "Your rights and choices" },
        { id: "retention", label: "Data retention" },
        { id: "children", label: "Children's privacy" },
        { id: "changes", label: "Changes to this policy" },
        { id: "contact", label: "Contact us" },
      ]}
    >
      <LegalSection id="introduction" num="1" title="Introduction">
        <LegalText lead>
          Donate the Blood is a community platform that connects people who need blood with
          verified donors nearby. In an emergency, an extra phone call or a public post with
          personal details shouldn&rsquo;t be the price of finding help.
        </LegalText>
        <LegalText>
          This policy explains what information we collect, why we collect it, and the choices
          you have over it. It applies to everyone who uses the platform — whether you
          register as a donor, raise a request, or just browse our pages. We keep it readable
          on purpose; if anything is unclear, contact us and we&rsquo;ll walk you through it.
        </LegalText>
      </LegalSection>

      <LegalSection id="what-we-collect" num="2" title="Information we collect">
        <ul className="space-y-3 text-base leading-7 text-mute">
          <li>
            <span className="font-semibold text-ink">Identity and contact details</span> — your
            name, phone number, and an optional email address, so requesters and the platform
            can reach you in an emergency.
          </li>
          <li>
            <span className="font-semibold text-ink">Matching information</span> — your blood
            group, city and area, and — if you choose to set a pin — precise coordinates, used
            only to match you with requests near you.
          </li>
          <li>
            <span className="font-semibold text-ink">Donation history</span> — the date of your
            last donation, so we can respect recovery guidance between donations.
          </li>
          <li>
            <span className="font-semibold text-ink">Verification documents</span> — for
            verification, you may share ID details with our team. These are used for
            verification only and are never shown to other users.
          </li>
          <li>
            <span className="font-semibold text-ink">Messages and requests</span> — the content
            of blood requests and the messages you send us through the contact form.
          </li>
          <li>
            <span className="font-semibold text-ink">Basic technical data</span> — device type
            and approximate region, so we can keep the platform working. We don&rsquo;t track
            you across unrelated websites.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-we-use" num="3" title="How we use your information">
        <LegalText>
          We use the information above for one purpose: connecting people who need blood with
          donors who can give it. Concretely, that means matching donors with nearby requests,
          alerting available donors about matching emergencies, and confirming that the donors
          who appear in search results are real. We also use it to protect the community —
          detecting fake accounts and spam — and to respond to the messages you send us.
        </LegalText>
      </LegalSection>

      <LegalSection id="how-we-share" num="4" title="How we share your information">
        <div className="rounded-2xl border border-fog bg-smoke/60 p-5 text-base leading-relaxed text-ink">
          <span className="font-semibold text-blood">The rule of consent: </span>
          a donor&rsquo;s contact details are shared with a requester{" "}
          <span className="font-semibold">only when the donor consents</span> — typically by
          responding to an alert about a matching request. Verification documents, such as ID
          details, are used internally and are never publicly displayed.
        </div>
        <LegalText>
          We do not sell, rent, or market your personal data to third parties. We share data
          with service providers only where strictly necessary to operate the platform (for
          example, messaging), and with authorities only where the law requires it.
        </LegalText>
      </LegalSection>

      <LegalSection id="security" num="5" title="Data security">
        <LegalText>
          Passwords are stored hashed, never as plain text. The tools that access sensitive
          records are access-controlled and used only to verify and moderate the platform. We
          apply reasonable, industry-typical safeguards to protect your data. No system is
          perfectly secure, which is why we also rely on you: don&rsquo;t share your password,
          and report anything that looks suspicious.
        </LegalText>
      </LegalSection>

      <LegalSection id="rights" num="6" title="Your rights and choices">
        <LegalText>
          You can edit or remove your donor profile from your dashboard at any time, toggle
          your availability when you can&rsquo;t donate, and withdraw consent to be contacted
          about matching requests (which simply means you won&rsquo;t be matched). You can also
          contact us to request a copy of, a correction of, or the deletion of the data we hold
          about you — we&rsquo;ll honor those requests promptly.
        </LegalText>
      </LegalSection>

      <LegalSection id="retention" num="7" title="Data retention">
        <LegalText>
          We keep active profiles for as long as your account is active. Verification documents
          and deleted profile data are retained only as long as necessary for safety and legal
          purposes, and are then deleted. If you ask us to delete your data, we honor that
          request unless the law requires us to keep it.
        </LegalText>
      </LegalSection>

      <LegalSection id="children" num="8" title="Children's privacy">
        <LegalText>
          We do not knowingly collect information from anyone under the age of 18, and the
          platform is not intended for users under 18 — blood donation carries age and health
          eligibility requirements. If you believe a child has provided us with information,
          contact us and we&rsquo;ll delete it.
        </LegalText>
      </LegalSection>

      <LegalSection id="changes" num="9" title="Changes to this policy">
        <LegalText>
          We may update this policy as the platform grows. If changes are significant, we&rsquo;ll
          let you know through the platform — for example, with a notice when you next log in.
          Continued use after the changes means you accept the updated policy.
        </LegalText>
      </LegalSection>

      <LegalSection id="contact" num="10" title="Contact us">
        <LegalText>
          Questions about privacy? Reach us through the contact form, or at
          donatetheblood@kivrosolutions.com. We&rsquo;ll do our best to respond promptly.
        </LegalText>
      </LegalSection>
    </LegalPage>
  );
}