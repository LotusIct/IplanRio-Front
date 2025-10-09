import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

export const getBrowserId = () => {
  let browserId = localStorage.getItem('browserId');
  if (!browserId) {
    browserId = uuidv4();
    localStorage.setItem('browserId', browserId);
  }
  return browserId;
};

export const montarBodyComBrowserId = (outrosCampos) => {
  const browserId = getBrowserId();

  return {
    ...outrosCampos,
    BrowserID: browserId
  };
};

const API = axios.create({
  baseURL: "https://iplanfacil-dev-restapi.onbmc.com/api",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-By": "XMLHttpRequest"
  }
});

export const login = async (email, senha) => {
  const data = new URLSearchParams();
  data.append("username", email);
  data.append("password", senha);
  return await axios.post(
    `${API.defaults.baseURL}/jwt/login`,
    data,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
};

export const cadastrarUsuario = async (token, body) => {
  const bodyComBrowserId = montarBodyComBrowserId(body);

  try {
    const response = await API.post(`/rx/application/record/recordinstance`, bodyComBrowserId, {
      headers: { Authorization: `AR-JWT ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar usuário", error);
    throw new Error("Falha ao cadastrar usuário");
  }
};


export const solicitarResetSenha = async (token, body) => {
  const bodyComBrowserId = montarBodyComBrowserId(body);

  try {
    const response = await API.post(`/rx/application/record/recordinstance`, bodyComBrowserId, {
      headers: { Authorization: `AR-JWT ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha", error);
    throw new Error("Falha ao solicitar redefinição de senha");
  }
};


export const criarNovaSenha = async (token, body) => {
  const bodyComBrowserId = montarBodyComBrowserId(body);

  try {
    const response = await API.post('/rx/application/record/recordinstance', bodyComBrowserId, {
      headers: {
        Authorization: `AR-JWT ${token}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar nova senha", error);
    throw new Error("Falha ao criar nova senha");
  }
};

export const buscarOrgaos = async (token) => {
  const url = `/arsys/v1/entry/COM:Company Alias LookUp?q='Company Abbreviation'="Órgãos" AND 'Status' = "Enabled"`;

  try {
    const response = await API.get(url, {
      headers: {
        Authorization: `AR-JWT ${token}`
      }
    });
    return response.data; 
  } catch (error) {
    console.error("Erro ao buscar órgãos", error);
    throw new Error("Erro ao buscar órgãos");
  }
};

export const validarEmailExistente = async (token, email) => {
  const url = `https://iplanfacil-dev-is.onbmc.com/api/rx/application/datapage/?dataPageType=com.bmc.arsys.rx.application.record.datapage.RecordInstanceDataPageQuery&pageSize=500&startIndex=0&recorddefinition=senha.reset:Person&536870914=${encodeURIComponent(email)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `AR-JWT ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Se retornar lista vazia, e-mail não existe
    if (!response.data.data || response.data.data.length === 0) {
      return false;
    }

    return true; // E-mail existe
  } catch (error) {
    console.error("Erro ao validar e-mail:", error);
    throw new Error("Falha ao validar e-mail");
  }
};

export const solicitarAlteracaoEmail = async (token, body) => {
  const bodyComBrowserId = montarBodyComBrowserId(body);

  try {
    const response = await API.post(
      `/rx/application/record/recordinstance`,
      bodyComBrowserId,
      {
        headers: {
          Authorization: `AR-JWT ${token}`,
          "X-Requested-By": "XMLHttpRequest",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro ao solicitar alteração de e-mail/telefone", error);
    throw new Error("Falha ao solicitar alteração de e-mail/telefone");
  }
};
