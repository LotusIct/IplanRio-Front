import React, { useState } from "react";
import { solicitarResetSenha } from "../services/api";
import "./ResetPasswordForm.css";
import { IoReturnUpBack } from "react-icons/io5";

const ResetPasswordForm = ({ token, onBack }) => {
  const [form, setForm] = useState({
    login: "", // novo campo unificado
    email: ""
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return alert("E-mail inválido");
    }

    if (!form.login || form.login.trim().length === 0) {
      return alert("Login de Usuário (CPF ou Matrícula) é obrigatório");
    }

    // Detecta tipo de login (CPF ou Matrícula)
    let cpfValue = "";
    let matriculaValue = "";
    const apenasNumeros = form.login.replace(/\D/g, "");

    if (apenasNumeros.length === 11) {
      cpfValue = apenasNumeros; // CPF detectado
    } else if (apenasNumeros.length === 9) {
      matriculaValue = form.login; // Matrícula detectada
    } else {
      return alert("Informe um CPF válido (11 dígitos) ou Matrícula válida (9 dígitos).");
    }

    const body = {
      recordDefinitionName: "senha.reset:Reset",
      resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
      fieldInstances: {
        "536870913": { value: form.email }, // Email
        "536870914": { value: cpfValue },   // CPF (se aplicável)
        "536870915": { value: matriculaValue } // Matrícula (se aplicável)
      }
    };

    try {
      if (!token) {
        return alert("Token não encontrado. Verifique a autenticação.");
      }

      await solicitarResetSenha(token, body);
      alert("E-mail enviado com o link de redefinição.");
    } catch (err) {
      console.error("Erro ao solicitar redefinição:", err);
      alert("Ocorreu um erro ao tentar enviar o e-mail. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Redefinição de Senha</h2>
        <IoReturnUpBack className="back-icon" onClick={onBack} />
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-block">
          <label>
            Login de Usuário (CPF ou Matrícula)
            <input
              name="login"
              placeholder="Digite seu CPF ou Matrícula "
              onChange={handleChange}
              required
            />
          </label>
             <label>
            E-mail corporativo
            <input
              name="email"
              type="email"
              placeholder="Ex: @prefeitura.rio | @rio.rj.gov.br"
              onChange={handleChange}
              required
            />
          </label>
        </div>


        <button type="submit" className="submit-btn">Solicitar Redefinição</button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
