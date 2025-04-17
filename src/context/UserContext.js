import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  console.log(user)

  return (
    <UserContext.Provider value={{ user, setUser }}>
        console
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
