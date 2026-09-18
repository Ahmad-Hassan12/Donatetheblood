import LegalPage, { LegalSection, LegalText } from "@/components/legal/LegalPage";

const NOTICE = (
  <>
    <span className="font-semibold text-ink">Heads-up:</span> this is a draft prepared for
    review. Before launch, these terms should be reviewed by a qualified legal professional —
    two placeholders remain (<span className="font-mono text-xs">[Country / Jurisdiction]</span>).
  </>
);

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="Donate the Blood connects people who need blood with donors who can give it. These are the ground rules everyone agrees to when they use it."
      notice={NOTICE}
      updated="September 2026"
      toc={[
        { id: "acceptance", label: "Acceptance of terms" },
        { id: "service", label: "Description of service" },
        { id: "eligibility", label: "Eligibility" },
        { id: "donors", label: "Donor responsibilities" },
        { id: "requesters", label: "Requester responsibilities" },
        { id: "verification", label: "Verification disclaimer" },
        { id: "liability", label: "Limitation of liability" },
        { id: "suspension", label: "Suspension and termination" },
        { id: "law", label: "Governing law" },
        { id: "changes", label: "Changes to these terms" },
        { id: "contact", label: "Contact us" },
      ]}
    >
      <LegalSection id="acceptance" num="1" title="Acceptance of terms">
        <LegalText lead>
          By creating an account, raising a request, or otherwise using Donate the Blood, you agree
          to these terms. If you don&rsquo;t agree, please don&rsquo;t use the platform.
        </LegalText>
      </LegalSection>

      <LegalSection id="service" num="2" title="Description of service">
        <LegalText>
          Donate the Blood is a matching platform that helps connect people who need blood
          (requesters) with registered donors. It is not a medical service, a blood bank, a
          hospital, or a substitute for professional medical care. In a medical emergency,
          always contact local emergency services first.
        </LegalText>
      </LegalSection>

      <LegalSection id="eligibility" num="3" title="Eligibility">
        <LegalText>
          You must be at least 18 to use the platform — consistent with blood donation
          eligibility. You agree to provide accurate, current information and to keep it up to
          date. Accounts created with false information, or by anyone under 18, may be
          suspended.
        </LegalText>
      </LegalSection>

      <LegalSection id="donors" num="4" title="Donor responsibilities">
        <LegalText>
          You are responsible for the accuracy of the blood type and any health or
          last-donation information you provide. We follow a general three-month interval
          between whole-blood donations, but your doctor&rsquo;s or blood bank&rsquo;s guidance
          always comes first. Respond honestly about your availability, and mark yourself
          unavailable when you cannot donate.
        </LegalText>
      </LegalSection>

      <LegalSection id="requesters" num="5" title="Requester responsibilities">
        <LegalText>
          Use requests for genuine needs only. Do not misrepresent a request, harvest donor
          contact information for unrelated purposes, or contact donors for any reason other
          than the request at hand. Misuse may lead to account termination.
        </LegalText>
      </LegalSection>

      <LegalSection id="verification" num="6" title="Verification disclaimer">
        <LegalText>
          We make reasonable efforts to verify donors before they appear in search results and
          to keep availability current. Even so, we cannot guarantee the accuracy,
          truthfulness, or completeness of any information provided by users. You interact
          with other users at your own discretion.
        </LegalText>
      </LegalSection>

      <LegalSection id="liability" num="7" title="Limitation of liability">
        <LegalText>
          Donate the Blood is a connection tool, not a medical provider. To the maximum extent
          permitted by law, we are not liable for the outcome of any donation arrangement, for
          delays or unavailability of the platform, or for the acts, omissions, or information
          of other users. Nothing in these terms limits liability that cannot be limited by
          law.
        </LegalText>
      </LegalSection>

      <LegalSection id="suspension" num="8" title="Suspension and termination">
        <LegalText>
          We may suspend or terminate accounts that are fake, spammy, abusive, or that misuse
          other members&rsquo; information, or that otherwise violate these terms. If we act on
          your account and you believe it was a mistake, contact us and we&rsquo;ll review it.
        </LegalText>
      </LegalSection>

      <LegalSection id="law" num="9" title="Governing law">
        <LegalText>
          These terms are governed by the laws of <span className="text-ink">[Country /
          Jurisdiction]</span>. This placeholder must be completed with the jurisdiction that
          governs the platform before launch.
        </LegalText>
      </LegalSection>

      <LegalSection id="changes" num="10" title="Changes to these terms">
        <LegalText>
          We may update these terms as the platform evolves. Significant changes will be
          communicated through the platform. Continued use after the changes means you accept
          the updated terms.
        </LegalText>
      </LegalSection>

      <LegalSection id="contact" num="11" title="Contact us">
        <LegalText>
          Questions about these terms? Reach us through the contact form, or at
          donatetheblood@kivrosolutions.com.
        </LegalText>
      </LegalSection>
    </LegalPage>
  );
}