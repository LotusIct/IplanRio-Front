import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CreateNewPasswordForm from "../components/NewPassword";
import { login } from "../services/api";
import { ClipLoader } from "react-spinners";
import logo from "../assets/Logo_Oficial.png";

const NewPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const chaveSolicitacao = searchParams.get("chaveSolicitacao");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await login("IntegracaoLogin", "P0rt@lS3nha");
        if (response.data && response.data.token) {
          setToken(response.data.token);
        } else {
          console.error("Token não encontrado no login");
        }
      } catch (error) {
        console.error("Falha no login", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  const handleBack = () => {
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#36d7b7" size={35} />
      </div>
    );
  }

  return (
     <div className="home-container">
          <header className="header">
            <img src={logo} alt="Logo" className="logo" />
          </header>
      <CreateNewPasswordForm 
        token={token} 
        chaveSolicitacao={chaveSolicitacao}
        onBack={handleBack}
      />
    </div>
  );
};

export default NewPasswordPage;
