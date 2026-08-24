import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/site-layout";
import { HomePage } from "./pages/home";
import { ProductPage } from "./pages/product";
import { SolutionsPage } from "./pages/solutions";
import { ResearchPage } from "./pages/research";
import { SecurityPage } from "./pages/security";
import { PricingPage } from "./pages/pricing";
import { AboutPage } from "./pages/about";
import { ContactPage } from "./pages/contact";
import { NotFoundPage } from "./pages/not-found";
import { PrivacyPage } from "./pages/privacy";
import { WaitlistPage } from "./pages/waitlist";

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="product" element={<ProductPage />} />
        <Route path="solutions" element={<SolutionsPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="waitlist" element={<WaitlistPage />} />
        {/* The live simulation (/try) and scripted demo (/demo) are parked
            behind the waitlist until the sandbox stack is hosted. */}
        <Route path="try" element={<WaitlistPage />} />
        <Route path="demo" element={<WaitlistPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
