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
import { DemoPage } from "./demo/demo-page";

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
        <Route path="demo" element={<DemoPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
