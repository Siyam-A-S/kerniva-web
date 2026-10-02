import { Navigate, Route, Routes } from "react-router-dom";
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
import { DemoPage } from "./pages/demo";

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
        {/* Old links. The waitlist is gone: a workspace now comes from booking
            a demo, so both land there. */}
        <Route path="waitlist" element={<Navigate to="/demo" replace />} />
        <Route path="try" element={<Navigate to="/demo" replace />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* The demo page carries its own stripped bar and footer, by design. */}
      <Route path="demo" element={<DemoPage />} />
    </Routes>
  );
}
