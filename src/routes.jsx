import Login from "./components/pages/login/login.jsx";
import Signup from "./components/pages/signup/signup.jsx";
import Chat from "./components/pages/chat/chat.jsx";
import PageNotFound from "./components/pages/404/404.jsx";
import { createBrowserRouter } from "react-router";

// Perkufizon te gjitha routat e aplikacionit dhe komponentin perkatese per secilen
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "chat",
    element: <Chat />,
  },
  // Kap cdo route tjeter dhe shfaq faqen 404
  {
    path: "*",
    element: <PageNotFound />,
  },
]);