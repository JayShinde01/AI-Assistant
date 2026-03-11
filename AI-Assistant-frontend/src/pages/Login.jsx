import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import axios from "axios"

function Login() {

  const navigate = useNavigate();

  async function handleSuccess(credentialResponse){

    const token = credentialResponse.credential;
    console.log(credentialResponse,"helo");
    

    try {

      const res = await axios.post(
        "http://localhost:8000/api/auth/google",
        { token }
      );

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data));

      navigate("/");

    } catch(err){
      console.log("Login error", err);
    }

  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login with Google</h2>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />

    </div>
  )
}

export default Login