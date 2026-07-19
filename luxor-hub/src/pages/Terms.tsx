import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10 font-sans text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground font-sans mb-8">Last updated: July 19, 2026</p>

          <div className="prose prose-invert max-w-none font-sans text-sm leading-relaxed space-y-6 text-muted-foreground">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using LUXOR® ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>LUXOR® is an AI-powered personal styling platform that helps users manage their wardrobe, receive outfit recommendations, and analyze their personal style. The Service includes a virtual closet, AI outfit suggestions, color analysis, trend intelligence, and optional virtual try-on features.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Account Registration</h2>
              <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 16 years old to use the Service.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Subscriptions & Payments</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Free tier accounts have limited features as described on the pricing page.</li>
                <li>Paid subscriptions (Starter, Pro, Elite) are billed monthly through PayPal.</li>
                <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
                <li>Refunds are handled per our 30-day money-back guarantee. Contact support@luxor.ly within 30 days of purchase for a full refund.</li>
                <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Your Content</h2>
              <p>You retain full ownership of all photos and wardrobe data you upload. By uploading content, you grant LUXOR® a limited license to process, analyze, and display your content solely for the purpose of providing the Service. This license terminates when you delete your content or account.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. AI-Generated Recommendations</h2>
              <p>LUXOR® uses artificial intelligence to generate outfit recommendations, color analysis, and style suggestions. These recommendations are provided for informational purposes only. LUXOR® is not liable for any outcomes resulting from following AI-generated advice, including but not limited to fashion choices, purchasing decisions, or personal expression.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Upload content that is illegal, harmful, or violates others' rights.</li>
                <li>Attempt to reverse-engineer, decompile, or extract the AI models or algorithms.</li>
                <li>Use automated tools to scrape or download content from the Service.</li>
                <li>Share your account credentials with others or use another user's account.</li>
                <li>Interfere with or disrupt the Service's infrastructure or security.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Intellectual Property</h2>
              <p>The Service, including its AI models, software, design, and branding, is the intellectual property of LUXOR®. You may not copy, modify, distribute, or reverse-engineer any part of the Service without written permission.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, LUXOR® shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">10. Termination</h2>
              <p>We may suspend or terminate your account if you violate these Terms. You may terminate your account at any time through the Settings page or by contacting support@luxor.ly. Upon termination, your data will be deleted per our Privacy Policy.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">11. Changes to Terms</h2>
              <p>We may update these Terms from time to time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Continued use after changes take effect constitutes acceptance of the new Terms.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-3">12. Contact</h2>
              <p>For questions about these Terms: <span className="text-foreground">support@luxor.ly</span></p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
