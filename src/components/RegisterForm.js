import React, { useState, useEffect } from "react";
import { cadastrarUsuario, buscarOrgaos } from "../services/api";
import "./RegisterForm.css"; 
import { IoReturnUpBack } from "react-icons/io5";
import Swal from "sweetalert2";

const RegisterForm = ({ token, onBack }) => {
  const [form, setForm] = useState({
    matricula: "", nome: "", cpf: "", email: "", orgao: "",
    endereco: "", complemento: "", bairro: "", municipio: "", cep: "", uf: "",
    tel1: "", emailAlternativo: "", tel2: ""
  });

  const [orgaos, setOrgaos] = useState([]);  
  const [loadingOrgaos, setLoadingOrgaos] = useState(false);

  // Máscaras para exibição
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
      return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  const formatCEP = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.length > 5 ? digits.slice(0,5) + "-" + digits.slice(5) : digits;
  };

  const formatMatricula = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 8) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 8) + "-" + digits.slice(8);
  };

  // Remove máscara para envio
  const limparMascara = (valor) => valor.replace(/\D/g, "");

  // Handle change
  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "cpf") value = formatCPF(value);
    if (name === "tel1" || name === "tel2") value = formatTelefone(value);
    if (name === "matricula") value = formatMatricula(value);
    if (name === "cep") value = formatCEP(value);
    setForm({ ...form, [name]: value });
  };

  // Buscar órgãos
  useEffect(() => {
    const fetchOrgaos = async () => {
      if (!token) return;
      setLoadingOrgaos(true);
      try {
        const response = await buscarOrgaos(token);
        const listaOrgaos = response.entries?.map(e => e.values.Company) || [];
        setOrgaos(listaOrgaos);
      } catch (err) {
        console.error("Erro ao buscar órgãos:", err);
        setOrgaos([]);
      }
      setLoadingOrgaos(false);
    };
    fetchOrgaos();
  }, [token]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!form.nome || !form.cpf || !form.matricula || !form.tel1 || !form.orgao || !form.endereco || !form.bairro || !form.municipio || !form.cep || !form.uf || !form.email) {
      return Swal.fire({ title: "Campos obrigatórios", text: "Preencha todos os campos obrigatórios.", icon: "warning", confirmButtonColor: "#2086CC" });
    }

    // Monta body exatamente igual ao Postman
    const body = {
      id: "",
      displayId: "",
      recordDefinitionName: "senha.reset:Cadastro",
      resourceType: "com.bmc.arsys.rx.services.record.domain.RecordInstance",
      permittedGroupsBySecurityLabels: {},
      permittedUsersBySecurityLabels: {},
      permittedRolesBySecurityLabels: {},
      fieldInstances: {
        "8": { id: 8, permissionType: "CHANGE", resourceType: "com.bmc.arsys.rx.services.record.domain.FieldInstance", value: form.nome },
        "536870913": { id: 536870913, value: form.email },
        "536870914": { id: 536870914, value: limparMascara(form.cpf) },
        "536870915": { id: 536870914, value: limparMascara(form.matricula) },
        "536870916": { id: 536870914, value: limparMascara(form.tel1) },
        "536870917": { id: 536870917, value: form.orgao },
        "536870918": { id: 536870918, value: form.endereco },
        "536870919": { id: 536870919, value: form.bairro },
        "536870920": { id: 536870920, value: form.municipio },
        "536870921": { id: 536870921, value: limparMascara(form.cep) },
        "536870922": { id: 536870921, value: form.complemento },
        "536870923": { id: 536870921, value: form.uf },
        "536870924": { id: 536870924, value: limparMascara(form.tel2) },      
        "536870925": { id: 536870925, value: form.emailAlternativo } 
      }
    };

    try {
      await cadastrarUsuario(token, body);
      Swal.fire({ title: "Cadastro realizado!", text: "Usuário cadastrado com sucesso.", icon: "success", confirmButtonColor: "#308FD8" });
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      Swal.fire({ title: "Erro!", text: "Não foi possível cadastrar o usuário.", icon: "error", confirmButtonColor: "#0F419B" });
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
          <label>Matrícula*  
            <input name="matricula" placeholder="99/123456-7" onChange={handleChange} value={form.matricula} required />
          </label>
          <label>Nome completo*  
            <input name="nome" placeholder="Ex: Marcelo Nogueira Junior" onChange={handleChange} value={form.nome} required />
          </label>
          <label>CPF*  
            <input name="cpf" placeholder="123.456.789-00" maxLength={14} onChange={handleChange} value={form.cpf} required />
          </label>
          <label>Telefone principal*  
            <input name="tel1" placeholder="(21) 99999-0000" maxLength={15} onChange={handleChange} value={form.tel1} required />
          </label>
        </div>

        <div className="form-block">
          <label>E-mail principal*  
            <input name="email" type="email" placeholder="@prefeitura.rio" onChange={handleChange} value={form.email} required />
          </label>
          <label>Órgão (lotação)*  
            {loadingOrgaos ? <p>Carregando órgãos...</p> : (
              <select name="orgao" value={form.orgao} onChange={handleChange} required>
                <option value="" disabled hidden>Selecione</option>
                {orgaos.map((orgao, idx) => <option key={idx} value={orgao}>{orgao}</option>)}
              </select>
            )}
          </label>
        </div>

        <div className="form-block">
          <label>Endereço do local de trabalho*  
            <input name="endereco" placeholder="Ex: Av das Américas, 1538" onChange={handleChange} value={form.endereco} required />
          </label>
          <label>Complemento  
            <input name="complemento" placeholder="Bloco A, apto 101" onChange={handleChange} value={form.complemento} />
          </label>
          <label>Bairro*  
            <input name="bairro" placeholder="Ex: Barra da Tijuca" onChange={handleChange} value={form.bairro} required />
          </label>
          <label>Município*  
            <input name="municipio" placeholder="Ex: Rio de Janeiro" onChange={handleChange} value={form.municipio} required />
          </label>
          <label>CEP*  
            <input name="cep" placeholder="Ex: 12345-678" onChange={handleChange} value={form.cep} required />
          </label>
          <label>UF*  
            <input name="uf" placeholder="Ex: RJ" onChange={handleChange} value={form.uf} required />
          </label>
        </div>

        <div className="form-block">
          <label>E-mail alternativo  
            <input name="emailAlternativo" type="email" placeholder="usuario@gmail.com" onChange={handleChange} value={form.emailAlternativo} />
          </label>
          <label>Telefone alternativo  
            <input name="tel2" placeholder="(21) 98888-1111" maxLength={15} onChange={handleChange} value={form.tel2} />
          </label>
        </div>

        <button className="submit-btn" type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default RegisterForm;
