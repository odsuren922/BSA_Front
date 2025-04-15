// import React, { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
// //TODO:: LOCAL HOST TT
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//             "mail": email, password }),
//       });

//       const data = await response.json();
//       console.log(data)
//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       login(data.user); // Save user info in context
//       localStorage.setItem("token", data.token); // Store JWT
//       if(data.user.role === "student"){
//         navigate("/student/dashboard")
//       }
//       //TODO:: TO TENHMIIN TUSLAH
//       else if(data.user.role === "admin"){
//       navigate("/admin/dashboard")
//       } else {
//          navigate("/"); 
//       }
     
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <form onSubmit={handleLogin}>
//         <input
//           type="email"
//           placeholder="Enter email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <br />
//         <input
//           type="password"
//           placeholder="Enter password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <br />
//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;
