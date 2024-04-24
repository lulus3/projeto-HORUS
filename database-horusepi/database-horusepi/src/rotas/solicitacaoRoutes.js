import express from 'express';
import solicitacaoController from '../controle/solicitacaoController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados das Solicitações
router.get('/', solicitacaoController.listarSolicitacao);
router.post('/submit', solicitacaoController.fazerSolicitacao);
router.get('/:id', solicitacaoController.listarSolicitacaoPorId);
router.get('/delete/:id', solicitacaoController.deletarSolicitacao);

export default router;
