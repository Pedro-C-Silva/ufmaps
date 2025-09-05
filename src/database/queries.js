// src/database/queries.js

import realm from './realm';
import { dadosUFMaps } from './schemas';

// Função para carregar os dados iniciais, APENAS se o banco estiver vazio
export const initializeDatabase = () => {
  const locais = realm.objects("Local");
  if (locais.length === 0) {
    console.log("Banco de dados vazio, populando com dados iniciais...");
    realm.write(() => {
      dadosUFMaps.forEach((item) => {
        realm.create("Local", item);
      });
    });
    console.log("Dados iniciais carregados.");
  } else {
    console.log("Banco de dados já populado.");
  }
};

// Função para buscar locais pelo nome
export const searchLocationsByName = (searchText) => {
  if (searchText.trim() === "") {
    return realm.objects("Local"); // Retorna todos se a busca for vazia
  }
  // A busca não diferencia maiúsculas/minúsculas
  return realm.objects("Local").filtered("nome CONTAINS[c] $0", searchText);
};