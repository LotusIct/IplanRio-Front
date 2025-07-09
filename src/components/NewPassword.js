import React, { useState } from "react";
import { criarNovaSenha } from "../services/api";
import "./NewPasswordForm.css";
import { IoReturnUpBack } from "react-icons/io5";

const CreateNewPasswordForm = ({ token, chaveSolicitacao, onBack }) => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erroConfirmacao, setErroConfirmacao] = useState("");
  const [tentouSubmeter, setTentouSubmeter] = useState(false);

  const avaliarForcaSenha = (senha) => {
    let score = 0;
    if (senha.length >= 8) score++;
    if (/[A-Z]/.test(senha)) score++;
    if (/[a-z]/.test(senha)) score++;
    if (/\d/.test(senha)) score++;
    if (/[^A-Za-z0-9]/.test(senha)) score++;

    if (score < 5) return "Fraca";
    return "Forte";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTentouSubmeter(true);
    setErroConfirmacao("");

    if (novaSenha.length !== 8) {
      return alert("Sua senha deve ter exatamente 8 caracteres.");
    }

    if (avaliarForcaSenha(novaSenha) === "Fraca") {
      return alert("Sua senha é muito fraca. Use letras maiúsculas, minúsculas, números e símbolos.");
    }

    if (novaSenha !== confirmacaoSenha) {
      setErroConfirmacao("As senhas não coincidem.");
      return;
    }

    const body = {
      recordDefinitionName: "senha.reset:NewPassword",
      resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
      fieldInstances: {
        "8": { value: chaveSolicitacao },
        "536870914": { value: novaSenha }
      }
    };

    try {
      if (!token) {
        return alert("Token não encontrado. Verifique a autenticação.");
      }

      await criarNovaSenha(token, body);
      alert("Senha redefinida com sucesso.");
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      alert("Erro ao tentar redefinir a senha. Tente novamente.");
    }
  };

  const forcaSenha = avaliarForcaSenha(novaSenha);

  const mostrarErroConfirmacao = 
    tentouSubmeter && novaSenha !== confirmacaoSenha && confirmacaoSenha.length > 0;

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Criar Nova Senha</h2>
        <IoReturnUpBack className="back-icon" onClick={onBack} />
      </div>

      <form onSubmit={handleSubmit} className="register-form">

        <div className="register-form-password">
          <div className="form-block">
            <label>
              Nova Senha
              <input
                type="password"
                name="novaSenha"
                placeholder="Digite sua nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={8}
                maxLength={8}
                required
              />
              <p className="senha-requisitos">
  Use <strong>8 caracteres</strong>: incluindo letra maiúscula, minúscula, número e símbolo.
</p>


            {novaSenha && (
              <p className={`senha-status senha-${forcaSenha.toLowerCase()}`}>
                Força da senha: {forcaSenha}
              </p>
            )}
            </label>
            
          </div>

          <div className="form-block">
            <label>
              Confirmar Senha
              <input
                type="password"
                name="confirmacaoSenha"
                placeholder="Confirme sua nova senha"
                value={confirmacaoSenha}
                onChange={(e) => setConfirmacaoSenha(e.target.value)}
                minLength={8}
                maxLength={8}
                required
              />
               {mostrarErroConfirmacao && (
              <p className="mensagem-erro">As senhas não coincidem.</p>
            )}
            </label>
           
          </div>
        </div>

        <button type="submit" className="submit-btn">Salvar Nova Senha</button>
      </form>
    </div>
  );
};

export default CreateNewPasswordForm;
