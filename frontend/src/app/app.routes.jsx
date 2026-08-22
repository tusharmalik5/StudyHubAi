import {createBrowserRouter} from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import VerifyEmail from "../features/auth/pages/VerifyEmail.jsx";

export const router = createBrowserRouter([
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/",
        element: <div>Home Page</div>
    },
    {
        path:"/verify-email",
        element:<VerifyEmail/>
    }
])