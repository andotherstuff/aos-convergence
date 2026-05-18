import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Program from "./pages/Program";
import EventDetails from "./pages/EventDetails";
import Projects from "./pages/Projects";
import Attending from "./pages/Attending";
import Messages from "./pages/Messages";
import AdminApprovals from "./pages/AdminApprovals";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

// NOTE: ExpressionOfInterest (the application page) is intentionally NOT routed
// — the application form was taken down from the site but kept in the codebase
// (src/pages/ExpressionOfInterest.tsx, the admin ApplicationsTab, and the
// worker endpoints remain) so it can be re-enabled later.

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/program" element={<Program />} />
        <Route path="/event" element={<EventDetails />} />
        <Route path="/attending" element={<Attending />} />
        <Route path="/projects" element={<Projects />} />
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
