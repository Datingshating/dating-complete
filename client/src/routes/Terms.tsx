import { Link } from 'react-router-dom'

export function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors"
            >
              <span className="text-3xl">💕</span>
              <h1 className="font-heading text-2xl font-bold">Whispyr</h1>
            </Link>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transform -rotate-90"
              >
                <path d="M9 18l6-6-6-6"/>
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-black text-card-foreground mb-4">
              Terms and Conditions
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By accessing and using Whispyr, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Whispyr is a photo-free dating platform that connects individuals through meaningful conversations and shared interests. Our service focuses on authentic connections based on personality, values, and compatibility rather than physical appearance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                3. User Accounts and Registration
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  To use Whispyr, you must create an account by providing accurate and complete information. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and up-to-date information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                4. User Conduct and Content Guidelines
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>You agree to use Whispyr responsibly and in accordance with our community standards:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be respectful and kind to other users</li>
                  <li>Do not share inappropriate, offensive, or harmful content</li>
                  <li>Do not impersonate others or provide false information</li>
                  <li>Do not engage in harassment, bullying, or discrimination</li>
                  <li>Do not share personal contact information in public profiles</li>
                  <li>Do not use the service for commercial purposes without permission</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                5. Privacy and Data Protection
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We are committed to protecting your privacy. Your personal information is collected, used, and protected in accordance with our Privacy Policy. We do not share your personal information with third parties without your consent, except as required by law or to provide our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                6. Premium Features and Payments
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>
                  Whispyr offers premium features and subscription plans. By purchasing premium features:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You agree to pay all applicable fees</li>
                  <li>Payments are processed securely through our payment partners</li>
                  <li>Subscription fees are non-refundable unless otherwise stated</li>
                  <li>We reserve the right to modify pricing with notice</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                7. Safety and Security
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>While we strive to create a safe environment, you are responsible for your own safety:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Never share personal financial information</li>
                  <li>Meet in public places for first dates</li>
                  <li>Trust your instincts and report suspicious behavior</li>
                  <li>Use our reporting features for inappropriate conduct</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All content, features, and functionality of Whispyr are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Whispyr is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                10. Termination
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our discretion. You may also terminate your account at any time by contacting our support team.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                11. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may update these Terms and Conditions from time to time. We will notify users of any material changes through the app or via email. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-4">
                12. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> support@whispyr.com<br />
                  <strong>Address:</strong> Whispyr Support Team<br />
                  <strong>Response Time:</strong> We typically respond within 24-48 hours
                </p>
              </div>
            </section>

            <div className="border-t border-border pt-8 mt-12">
              <p className="text-center text-sm text-muted-foreground">
                By using Whispyr, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">💕</span>
              <h3 className="font-heading text-xl font-bold text-card-foreground">Whispyr</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Find Your Perfect Match Through Words, Not Photos
            </p>
            <div className="flex justify-center gap-6 mt-6">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Home
              </Link>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
