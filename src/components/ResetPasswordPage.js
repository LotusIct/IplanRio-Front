import React, { useState } from "react";
import { solicitarResetSenha } from "../services/api";
import "./ResetPasswordForm.css";
import { IoReturnUpBack } from "react-icons/io5";

const ResetPasswordForm = ({ token, onBack }) => {
  const [form, setForm] = useState({
    matricula: "", nome: "", cpf: "", email: ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return alert("E-mail inválido");
    }
  
    // Validação de CPF
    if (!form.cpf || form.cpf.trim().length < 11) {
      return alert("CPF inválido ou incompleto");
    }
  
    // Validação de matrícula
    if (!form.matricula || form.matricula.trim().length === 0) {
      return alert("Matrícula obrigatória");
    }
  
    const body = {
      recordDefinitionName: "senha.reset:Reset",
      resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
      fieldInstances: {
        "536870913": { value: form.email },     // Email
        "536870914": { value: form.cpf },       // CPF
        "536870915": { value: form.matricula }  // Matrícula
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
        <div className="form-block">
          <label>
            Matrícula
            <input name="matricula" placeholder="Formato padrão (Ex: 99/123456-7)" onChange={handleChange} required />
          </label>
        </div>

        <div className="form-block">
          <label>
            Nome completo
            <input name="nome" placeholder="Ex: Marcelo Nogueira Junior" onChange={handleChange} required />
          </label>
        </div>
        </div>

        <div className="form-block">
          <div className="form-block">
            <label>
              CPF
              <input name="cpf" placeholder="Ex: 12345678900" onChange={handleChange} required />
            </label>
          </div>

          <div className="form-block">
            <label>
              E-mail corporativo
              <input name="email" type="email" placeholder="Ex: @prefeitura.rio | @rio.rj.gov.br" onChange={handleChange} required />
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn">Solicitar Redefinição</button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
