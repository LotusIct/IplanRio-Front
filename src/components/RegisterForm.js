import React, { useState, useEffect } from "react";
import { cadastrarUsuario, buscarOrgaos } from "../services/api"; // Supondo que buscarOrgaos faça a chamada ao endpoint que você passou
import "./RegisterForm.css"; 
import { IoReturnUpBack } from "react-icons/io5";

const RegisterForm = ({ token, onBack }) => {
  const [form, setForm] = useState({
    matricula: "", nome: "", cpf: "", email: "", orgao: "",
    endereco: "", complemento: "", bairro: "", tel1: ""
  });

  const [orgaos, setOrgaos] = useState([]);   // Estado para órgãos carregados
  const [loadingOrgaos, setLoadingOrgaos] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const fetchOrgaos = async () => {
      if (!token) return;  // Não busca se não tiver token

      setLoadingOrgaos(true);
      try {
        const response = await buscarOrgaos(token);
        if (response.entries && response.entries.length > 0) {
          // Extrai os nomes dos órgãos
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

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return alert("E-mail inválido");
    }

    // Validação de campos obrigatórios
    if (!form.nome || !form.cpf || !form.matricula) {
      return alert("Preencha todos os campos obrigatórios: Nome, CPF e Matrícula.");
    }

    const body = {
      recordDefinitionName: "senha.reset:Cadastro",
      resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
      fieldInstances: {
        "8": { value: form.nome },                     // Nome
        "536870913": { value: form.email },             // Email
        "536870914": { value: form.cpf },               // CPF
        "536870915": { value: form.matricula },         // Matrícula
        "536870916": { value: form.tel1 },              // Telefone principal
        "536870917": { value: form.orgao },             // Órgão
        "536870918": { value: form.endereco },          // Endereço
        "536870919": { value: form.bairro },            // Bairro
        "536870922": { value: form.complemento }        // Complemento
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
        {/* Bloco 1: Identificação */}
        <div className="form-block">
          <label>Matrícula*  
            <input
              name="matricula"
              placeholder="Formato padrão (Ex: 99/123456-7)"
              onChange={handleChange}
              required
              value={form.matricula}
            />
          </label>
          <label>Nome completo*  
            <input
              name="nome"
              placeholder="Ex: Marcelo Nogueira Junior"
              onChange={handleChange}
              required
              value={form.nome}
            />
          </label>
          <label>CPF*  
            <input
              name="cpf"
              placeholder="Ex: 12345678900"
              onChange={handleChange}
              required
              value={form.cpf}
            />
          </label>
          <label>Telefone principal*  
            <input
              name="tel1"
              placeholder="Ex: (21) 99999-0000"
              onChange={handleChange}
              required
              value={form.tel1}
            />
          </label>
        </div>

        {/* Bloco 2: Contato Institucional */}
        <div className="form-block">
          <label>E-mail corporativo*  
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

        {/* Bloco 3: Endereço */}
        <div className="form-block">
          <label>Endereço*  
            <input
              name="endereco"
              placeholder="Ex: Av das Américas, 1538"
              onChange={handleChange}
              required
              value={form.endereco}
            />
          </label>
          <label>Complemento*
            <input
              name="complemento"
              placeholder="Ex: Bloco A, apto 101"
              onChange={handleChange}
              value={form.complemento}
            />
          </label>
          <label>Bairro*  
            <input
              name="bairro"
              placeholder="Ex: Barra da Tijuca"
              onChange={handleChange}
              required
              value={form.bairro}
            />
          </label>
        </div>

       

        <button className="submit-btn" type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default RegisterForm;
