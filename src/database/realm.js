// src/database/realm.js

import Realm from "realm";
import { LocalSchema } from "./schemas"; // Importa nosso schema

// Configuração centralizada do Realm
const realmConfig = {
  path: 'ufmaps.realm',
  schema: [LocalSchema],
  schemaVersion: 1, // Mude a versão se alterar o schema no futuro
};

// Abre a conexão e exporta a instância para ser usada em todo o app
const realm = new Realm(realmConfig);

export default realm;