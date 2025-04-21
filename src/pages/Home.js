import React from "react";
import { useAuth } from '../context/AuthContext';
const Home = () => {
    const { user } = useAuth();
    console.log(user)

  return <h1>Welcome to the Home Page, {user.role}</h1>;
};

export default Home;
