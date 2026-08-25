import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import { useEffect } from "react";
import { useAuth } from "../features/auth/hook/useAuth";

function App() {

  const {checkAuth} = useAuth();

  useEffect(()=>{
    checkAuth();
    console.log("checkAuth called")
  },[]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
