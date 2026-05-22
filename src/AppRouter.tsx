import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Program from "./pages/Program";
import ExpressionOfInterest from "./pages/ExpressionOfInterest";
import EventDetails from "./pages/EventDetails";
import WelcomeGuide from "./pages/WelcomeGuide";
import Projects from "./pages/Projects";
import HardProblems from "./pages/HardProblems";
import Attending from "./pages/Attending";
import Messages from "./pages/Messages";
import AdminApprovals from "./pages/AdminApprovals";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/program" element={<Program />} />
        <Route path="/apply" element={<ExpressionOfInterest />} />
        <Route path="/event" element={<EventDetails />} />
        <Route path="/welcome-guide" element={<WelcomeGuide />} />
        <Route path="/attending" element={<Attending />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/hard-problems" element={<HardProblems />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin" element={<AdminApprovals />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
