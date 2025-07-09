import React, { useState, useEffect } from "react";
import RegisterForm from "../components/RegisterForm";
import ResetPasswordForm from "../components/ResetPasswordPage";
import "./HomePage.css";
import logo from "../assets/Logo_Oficial.png";
import { login } from "../services/api"; 

const HomePage = () => {
  const [opcao, setOpcao] = useState(null);
  const [token, setToken] = useState(null);

  // Exemplo: valores fixos ou você pode coletar via formulário
  const chaveSolicitacao = "chave-exemplo";
  const idDoNavegador = "id-navegador-exemplo";

  const voltarParaHome = () => {
    setOpcao(null);
  };

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
      }
    };

    fetchToken();
  }, []);

  return (
    <div className="home-container">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
      </header>

      {!opcao && (
        <div className="card-wrapper">
          <div className="card">
            <h2>Cadastrar Usuário</h2>
            <p>Realize o cadastro de um novo usuário no sistema.</p>
            <button onClick={() => setOpcao("cadastro")}>Cadastrar</button>
          </div>

          <div>
            <div className="separator-text">OU</div>
          </div>

          <div className="card">
            <h2>Redefinir Senha</h2>
            <p>Envie uma solicitação para redefinir sua senha.</p>
            <button onClick={() => setOpcao("reset")}>Redefinir Senha</button>
          </div>

        </div>
      )}

      {opcao === "cadastro" && <RegisterForm token={token} onBack={voltarParaHome} />}
      {opcao === "reset" && <ResetPasswordForm token={token} onBack={voltarParaHome} />}
  
    </div>
  );
};

export default HomePage;
