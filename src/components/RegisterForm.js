import React, { useState, useEffect } from "react";
import { cadastrarUsuario, buscarOrgaos } from "../services/api";
import "./RegisterForm.css"; 
import { IoReturnUpBack } from "react-icons/io5";

const RegisterForm = ({ token, onBack }) => {
  const [form, setForm] = useState({
    matricula: "", nome: "", cpf: "", email: "", orgao: "",
    endereco: "", complemento: "", bairro: "", tel1: "", emailAlternativo: "",
    tel2: ""
  });

  const [orgaos, setOrgaos] = useState([]);  
  const [loadingOrgaos, setLoadingOrgaos] = useState(false);

  // Funções para mascarar CPF e Telefone (formato brasileiro)
  const formatCPF = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  };

  const formatTelefone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      // Formato telefone fixo ou celular 10 dígitos: (99) 9999-9999
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      // Formato celular 11 dígitos: (99) 99999-9999
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  // Remove máscara - só números
  const limparMascara = (valor) => valor.replace(/\D/g, "");

  // Manipula mudanças no form, aplicando máscara nos campos cpf, tel1 e tel2
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "cpf") {
      value = formatCPF(value);
    } else if (name === "tel1" || name === "tel2") {
      value = formatTelefone(value);
    }

    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    const fetchOrgaos = async () => {
      if (!token) return;  

      setLoadingOrgaos(true);
      try {
        const response = await buscarOrgaos(token);
        if (response.entries && response.entries.length > 0) {
          const listaOrgaos = response.entries.map(entry => entry.values.Company);
          setOrgaos(listaOrgaos);
        } else {
          setOrgaos([]);
        }
      } catch (err) {
        console.error("Erro ao buscar órgãos:", err);
        setOrgaos([]);
      }
      setLoadingOrgaos(false);
    };

    fetchOrgaos();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return alert("E-mail inválido");
    }

    if (!form.nome || !form.cpf || !form.matricula) {
      return alert("Preencha todos os campos obrigatórios: Nome, CPF e Matrícula.");
    }

    const body = {
      recordDefinitionName: "senha.reset:Cadastro",
      resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
      fieldInstances: {
        "8": { value: form.nome },
        "536870913": { value: form.email },
        "536870914": { value: limparMascara(form.cpf) },       // cpf sem máscara
        "536870915": { value: form.matricula },
        "536870916": { value: limparMascara(form.tel1) },      // tel1 sem máscara
        "536870917": { value: form.orgao },
        "536870918": { value: form.endereco },
        "536870919": { value: form.bairro },
        "536870922": { value: form.complemento },
        "536870923": { value: form.emailAlternativo },
        "536870924": { value: limparMascara(form.tel2) }       // tel2 sem máscara
      }
    };

    if (!token) {
      return alert("Token não encontrado. Verifique a autenticação.");
    }

    try {
      await cadastrarUsuario(token, body);
      alert("Usuário cadastrado com sucesso. Verifique seu e-mail.");
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      alert("Erro ao cadastrar usuário. Tente novamente.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Cadastro de Usuário</h2>
        <IoReturnUpBack className="back-icon" onClick={onBack} />
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-block">
          <label>
            Matrícula*  
            <input
              name="matricula"
              placeholder="Formato padrão (Ex: 99/123456-7)"
              onChange={handleChange}
              required
              value={form.matricula}
            />
          </label>

          <label>
            Nome completo*  
            <input
              name="nome"
              placeholder="Ex: Marcelo Nogueira Junior"
              onChange={handleChange}
              required
              value={form.nome}
            />
          </label>

          <label>
            CPF*  
            <input
              name="cpf"
              placeholder="Ex: 123.456.789-00"
              onChange={handleChange}
              maxLength={14}
              required
              value={form.cpf}
            />
          </label>

          <label>
            Telefone principal*  
            <input
              name="tel1"
              placeholder="Ex: (21) 99999-0000"
              onChange={handleChange}
              maxLength={15}
              required
              value={form.tel1}
            />
          </label>
        </div>

        <div className="form-block">
          <label>
            E-mail principal*  
            <input
              name="email"
              type="email"
              placeholder="Ex: @prefeitura.rio | @rio.rj.gov.br"
              onChange={handleChange}
              required
              value={form.email}
            />
          </label>

          <label>
            Órgão (lotação)*
            {loadingOrgaos ? (
              <p>Carregando órgãos...</p>
            ) : (
              <select
                name="orgao"
                value={form.orgao}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>Selecione sua lotação atual</option>
                {orgaos.length > 0 ? (
                  orgaos.map((orgao, index) => (
                    <option key={index} value={orgao}>{orgao}</option>
                  ))
                ) : (
                  <option disabled>Nenhum órgão disponível</option>
                )}
              </select>
            )}
          </label>
        </div>

        <div className="form-block">
          <label>
            Endereço do local de trabalho*  
            <input
              name="endereco"
              placeholder="Ex: Av das Américas, 1538"
              onChange={handleChange}
              required
              value={form.endereco}
            />
          </label>

          <label>
            Complemento
            <input
              name="complemento"
              placeholder="Ex: Bloco A, apto 101"
              onChange={handleChange}
              value={form.complemento}
            />
          </label>

          <label>
            Bairro*  
            <input
              name="bairro"
              placeholder="Ex: Barra da Tijuca"
              onChange={handleChange}
              required
              value={form.bairro}
            />
          </label>
        </div>

        <div className="form-block">
          <label>
            E-mail alternativo
            <input
              name="emailAlternativo"
              type="email"
              placeholder="Ex: usuario@gmail.com"
              onChange={handleChange}
              value={form.emailAlternativo}
            />
          </label>

          <label>
            Telefone alternativo
            <input
              name="tel2"
              placeholder="Ex: (21) 98888-1111"
              onChange={handleChange}
              maxLength={15}
              value={form.tel2}
            />
          </label>
        </div>

        <button className="submit-btn" type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default RegisterForm;
