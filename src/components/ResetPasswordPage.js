import React, { useState } from "react";
import {
  solicitarResetSenha,
  validarEmailExistente,
  solicitarAlteracaoEmail,
} from "../services/api";
import "./ResetPasswordForm.css";
import { IoReturnUpBack } from "react-icons/io5";
import Swal from "sweetalert2";
import alertaIcon from '../assets/warning.png'; // ajuste o caminho conforme sua estrutura
import { IMaskInput } from 'react-imask';


const ResetPasswordForm = ({ token, onBack }) => {
  const [form, setForm] = useState({
    login: "",
    email: "",
  });

  const [alteracaoForm, setAlteracaoForm] = useState({
    cpf: "",
    matricula: "",
    telefone: "",
    telefoneAlternativo: "",
    emailAlternativo: "",
  });

  const [showModal, setShowModal] = useState(false); // controla a exibição do modal

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAlteracaoChange = (e) =>
    setAlteracaoForm({ ...alteracaoForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
       return Swal.fire({
    title: "E-mail inválido",
    text: "Verifique o formato do e-mail informado.",
    icon: "warning",
     background: "#ffffffff",
  color: "#333",
    confirmButtonColor: "#2086CC",
    confirmButtonText: "OK"
  });
    }

    if (!form.login || form.login.trim().length === 0) {
       return Swal.fire({
    title: "Login obrigatório",
    text: "Informe o CPF ou Matrícula para continuar.",
    icon: "warning",
     background: "#ffffffff",
  color: "#333",
    confirmButtonColor: "#2086CC",
    confirmButtonText: "OK"
  });
    }

    const apenasNumeros = form.login.replace(/\D/g, "");
    let cpfValue = "";
    let matriculaValue = "";

    if (apenasNumeros.length === 11) cpfValue = apenasNumeros;
    else if (apenasNumeros.length === 9) matriculaValue = form.login;
    else return Swal.fire({
    title: "Dados inválidos",
    text: "Informe um CPF válido (11 dígitos) ou Matrícula válida (9 dígitos).",
    icon: "error",
     background: "#ffffffff",
  color: "#333",
    confirmButtonColor: "#0F419B",
    confirmButtonText: "Entendi"
  });

    if (!token) {
      return Swal.fire({
    title: "Token ausente",
    text: "Token não encontrado. Verifique a autenticação.",
    icon: "error",
     background: "#ffffffff",
  color: "#333",
    confirmButtonColor: "#0F419B",
    confirmButtonText: "Entendi"
  });
    }

    try {
      const emailExiste = await validarEmailExistente(token, form.email);

      if (!emailExiste) {
        // Exibe o modal se o e-mail não for encontrado
        setShowModal(true);
        return;
      }

      // E-mail válido → segue fluxo normal de reset
      const bodyReset = {
        recordDefinitionName: "senha.reset:Reset",
        resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
        fieldInstances: {
          "536870913": { value: form.email },
          "536870914": { value: cpfValue },
          "536870915": { value: matriculaValue },
        },
      };

      await solicitarResetSenha(token, bodyReset);
       Swal.fire({
    title: "E-mail enviado!",
    text: "O link de redefinição foi enviado com sucesso.",
    icon: "success",
    background: "#ffffffff",
  color: "#333",
    confirmButtonColor: "#2086CC",
    confirmButtonText: "OK"
  });
    } catch (err) {
      console.error("Erro:", err);
      Swal.fire({
    title: "Erro!",
    text: "Ocorreu um erro ao processar sua solicitação. Verifique os dados e tente novamente.",
    icon: "error",
    background: "#ffffffff",
  color: "#333",
    confirmButtonColor: "#0F419B",
    confirmButtonText: "Entendi"
  });
    }
  };

  const handleSolicitarAlteracao = async (e) => {
  e.preventDefault();

  const { loginModal, telefone, telefoneAlternativo, emailAlternativo } = alteracaoForm;

  if (!loginModal || loginModal.trim().length === 0) {
    return Swal.fire({
      title: "CPF ou Matrícula obrigatório",
      text: "Preencha o campo CPF ou Matrícula.",
      icon: "warning",
      background: "#ffffffff",
      color: "#333",
      confirmButtonColor: "#2086CC",
      confirmButtonText: "OK"
    });
  }

  const apenasNumeros = loginModal.replace(/\D/g, "");
  let cpfValue = "";
  let matriculaValue = "";

  if (apenasNumeros.length === 11) cpfValue = apenasNumeros;
  else if (apenasNumeros.length === 9) matriculaValue = loginModal;
  else return Swal.fire({
    title: "Dados inválidos",
    text: "Informe um CPF válido (11 dígitos) ou Matrícula válida (9 dígitos).",
    icon: "error",
    background: "#ffffffff",
    color: "#333",
    confirmButtonColor: "#0F419B",
    confirmButtonText: "Entendi"
  });

  try {
    const bodyAlteracao = {
      recordDefinitionName: "senha.reset:CadastroEmail",
      resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
      fieldInstances: {
        "8": { id: 8, value: loginModal },
        "536870913": { id: 536870913, value: form.email }, // e-mail original
        "536870914": { id: 536870914, value: cpfValue },
        "536870915": { id: 536870914, value: matriculaValue },
        "536870916": { id: 536870914, value: telefone },
        "536870924": { id: 536870924, value: telefoneAlternativo },
        "536870925": { id: 536870925, value: emailAlternativo }, // e-mail alternativo
      },
    };

    await solicitarAlteracaoEmail(token, bodyAlteracao);
    Swal.fire({
      title: "Solicitação enviada!",
      text: "Atualização de e-mail/telefone realizada com sucesso.",
      icon: "success",
      background: "#ffffffff",
      color: "#333",
      confirmButtonColor: "#2086CC",
      confirmButtonText: "OK"
    });
    setShowModal(false);
  } catch (err) {
    console.error("Erro ao solicitar alteração:", err);
    Swal.fire({
      title: "Erro!",
      text: "Não foi possível enviar a solicitação. Tente novamente.",
      icon: "error",
      background: "#ffffffff",
      color: "#333",
      confirmButtonColor: "#0F419B",
      confirmButtonText: "Entendi"
    });
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
              placeholder="Digite seu CPF ou Matrícula"
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

        <button type="submit" className="submit-btn">
          Solicitar Redefinição
        </button>
      </form>

      {/* 🔹 Modal de alteração de e-mail */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal">
     <div className="background" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <img src={alertaIcon} alt="Alerta" style={{ width: '60px', height: '60px', marginLeft: '20px' }} />
  <h3>O e-mail informado não corresponde ao cadastrado!</h3>
</div>

      <div className="modular">
        <p>Deseja solicitar a atualização do cadastro de e-mail e telefone?</p>

      <form onSubmit={handleSolicitarAlteracao} className="modal-form">
        <label>
          CPF ou Matrícula
          <input
            name="loginModal"
            placeholder="Digite seu CPF ou Matrícula"
            onChange={(e) =>
              setAlteracaoForm({ ...alteracaoForm, loginModal: e.target.value })
            }
          />
        </label>

        <label>
          E-mail
          <input
            name="emailOriginal"
            type="email"
            value={alteracaoForm.emailOriginal || form.email}
            onChange={(e) =>
              setAlteracaoForm({ ...alteracaoForm, emailOriginal: e.target.value })
            }
            placeholder="Digite seu e-mail"
          />
        </label>

<label>
  Telefone
  <IMaskInput
    mask="(00) 00000-0000"
    value={alteracaoForm.telefone}
    onAccept={(value) => setAlteracaoForm({ ...alteracaoForm, telefone: value })}
    placeholder="(21) 99999-9999"
  />
</label>

<label>
  Telefone Alternativo
  <IMaskInput
    mask="(00) 00000-0000"
    value={alteracaoForm.telefoneAlternativo}
    onAccept={(value) => setAlteracaoForm({ ...alteracaoForm, telefoneAlternativo: value })}
    placeholder="(21) 98888-8888"
  />
</label>


        <label>
          E-mail Alternativo
          <input
            name="emailAlternativo"
            type="email"
            placeholder="Digite um e-mail alternativo"
            onChange={handleAlteracaoChange}
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="cancel-btn"
          >
            Cancelar
          </button>
          <button type="submit" className="confirm-btn">
            Enviar Solicitação
          </button>
        </div>
      </form>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default ResetPasswordForm;
