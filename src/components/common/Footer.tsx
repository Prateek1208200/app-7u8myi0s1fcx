import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                B
              </div>
              <span className="text-xl font-bold">BlogPlatform</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              A premium blogging platform for professional content creators. Publish, monetize, and
              grow your audience with powerful tools and analytics.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/explore" className="hover:text-foreground transition-smooth">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-foreground transition-smooth">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-smooth">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-smooth">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-foreground transition-smooth">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-smooth">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-smooth">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-smooth">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>2025 BlogPlatform</p>
        </div>
      </div>
    </footer>
  );
}
