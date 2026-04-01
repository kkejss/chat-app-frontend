import Login from "./components/auth/LoginPage.jsx";
import PageNotFound from "./components/auth/404.jsx";
import Signup from "./components/auth/SignupPages.jsx";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "tasks",
    element: <Chats />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);