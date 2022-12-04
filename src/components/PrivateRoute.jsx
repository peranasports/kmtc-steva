import { Navigate, Outlet } from "react-router-dom";

// Custom Hooks
import { useAuthStatus } from "./../hooks/useAuthStatus";

// Components
import Spinner from "./Spinner";

const PrivateRoute = () => {
  const { loggedIn, currentUser, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    return <Spinner />;
  }

  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
