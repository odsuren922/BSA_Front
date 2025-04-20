import React from "react";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Main from "./modules/Main";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { UserProvider, useUser } from "./context/UserContext";

function AppContent() {
  const { setUser } = useUser();
  const [authState, setAuthState] = React.useState(null);

  React.useEffect(() => {
    const unSubscribeAuth = onAuthStateChanged(auth, (authenticatedUser) => {
      if (authenticatedUser) {
        setUser(authenticatedUser);
        setAuthState("main");
      } else {
        setUser(null);
        setAuthState("login");
      }
    });

    return unSubscribeAuth;
  }, [setUser]);

  if (authState === null)
    return <div className="font-bold text-center text-5xl">loading...</div>;
  if (authState === "login") return <Login setAuthState={setAuthState} />;
  if (authState === "register") return <Register setAuthState={setAuthState} />;
  return <Main setAuthState={setAuthState} />;
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
