import { useDispatch, useSelector } from "react-redux";
import { register, login, verifyEmail, logout, getMe} from "../service/auth.api.js";
import { setUser, setLoading, setError, clearUser } from "../auth.slice.js";

export function useAuth() {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);

  async function handleRegister({ username, email, password }) {
    try {
      dispatch(setLoading(true));
      await register({ username, email, password });
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
      const data = await login({ email, password });
      dispatch(setUser(data.user));
      return true;
    } catch (error) {
      dispatch(setError(error.message));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
  try {
    dispatch(setLoading(true));
    await logout(); 
    dispatch(clearUser()); 
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

async function checkAuth() {
  try {
    dispatch(setLoading(true));
    const data = await getMe();
    
    dispatch(setUser(data.user));
  } catch (error) {
    dispatch(clearUser());
  } finally {
    dispatch(setLoading(false));
  }
}

  return {
    handleRegister,
    handleLogin,
    handleVerifyEmail,
    handleLogout,
    checkAuth,
    loading,
    error,
    user,
  };
}
