import { useDispatch, useSelector } from "react-redux";
import {register, login, verifyEmail} from "../service/auth.api.js"
    import { setUser, setLoading, setError } from "../auth.slice.js";

export function useAuth() {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth); // ye line add karo



  async function handleRegister({ username, email, password }) {
    try {
      dispatch(setLoading(true));
      await register({ username, email, password }); // lowercase register - API function
      return true;
    } catch (error) {
      dispatch(setError(error.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      const data = await login({ email, password }); // lowercase login - API function
      dispatch(setUser(data.user));
      return true;
    } catch (error) {
      dispatch(setError(error.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleVerifyEmail(token) {
    try {
      dispatch(setLoading(true));
      await verifyEmail(token);
      return true;
    } catch (error) {
      dispatch(setError(error.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }

  return { handleRegister, handleLogin, handleVerifyEmail, loading, error, user }; // ye return update karo
}