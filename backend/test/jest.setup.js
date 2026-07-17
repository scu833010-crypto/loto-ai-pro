// Las pruebas que tocan el repositorio (normalizador -> eventosRepo ->
// database.js) no deben crear ni tocar el archivo real data.sqlite del
// proyecto — se usa una base en memoria, exclusiva de cada corrida.
process.env.DB_PATH = ":memory:";
