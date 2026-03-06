import React, { useEffect, useState } from "react";

const Footer: React.FC = () => {
  const [footer, setFooter] = useState<any>({});

  useEffect(() => {
    fetch("/footer")
      .then((res) => res.json())
      .then((data) => setFooter(data))
      .catch(() => {});
  }, []);
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-xl mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
        
        {/* Website Info */}
        <div>
          <h2 className="text-lg font-bold text-foreground">WealthPulse</h2>
          <p className="text-sm text-muted-foreground mt-2">
            WealthPulse is a smart stock analysis and portfolio management
            platform that helps investors track markets, manage portfolios,
            and make better financial decisions.
          </p>
        </div>

        {/* Company Details */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Company Details
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
           <li>{footer.company}</li>
           <li>GSTIN: {footer.gst}</li>
           <li>{footer.address}</li>
        <li>Founded: {footer.founded}</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Contact Us
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
             <li>📞 {footer.phone}</li>
            <li>📧 {footer.email}</li>
          </ul>
        </div>

        {/* Important Links */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Important Links
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <a href="/about" className="hover:text-foreground">
                About Us
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-foreground">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/support" className="hover:text-foreground">
                Help / Support
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WealthPulse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;