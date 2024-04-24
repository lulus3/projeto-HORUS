import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import administradorRoutes from './src/rotas/administradorRoutes.js'
import epiRoutes from './src/rotas/epiRoutes.js'
import setorRoutes from './src/rotas/setorRoutes.js'
import supervisorRoutes from './src/rotas/supervisorRoutes.js'
import cameraRoutes from './src/rotas/cameraRoutes.js'
import epicamRoutes from './src/rotas/epicamRoutes.js'
import solicitacaoRoutes from './src/rotas/solicitacaoRoutes.js'
import relatorioRoutes from './src/rotas/relatorioRoutes.js'
import epiocorrenciaRoutes from './src/rotas/epiocorrenciaRoutes.js'
import excluirRelatorios from './src/del_gravs.js'

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Instanciar o Express para criar e configurar um servidor para a aplicação
const app = express();
const IP = process.env.MY_IP;
const PORT = process.env.MY_PORT;

// Permitindo todas as origens
app.use(cors());

// Indicar para o express ler body com json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Definir rotas para a manipulação de dados
app.use('/administrador', administradorRoutes);
app.use('/epi', epiRoutes);
app.use('/setor', setorRoutes);
app.use('/supervisor', supervisorRoutes);
app.use('/camera', cameraRoutes);
app.use('/epicam', epicamRoutes);
app.use('/solicitacao', solicitacaoRoutes);
app.use('/relatorio', relatorioRoutes);
app.use('/epiocorrencia', epiocorrenciaRoutes);

// Função para excluir os relatórios com uma permanência maior que um dia
excluirRelatorios();

// Definir a porta do servidor e fazê-lo funcionar
app.listen(PORT, () => {
  console.log(`Servidor rodando no endereço http://${IP}:${PORT}`);
});
