import express from 'express';
import relatorioController from '../controle/relatorioController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados dos Relatórios
router.get('/', relatorioController.listarRelatorio);
router.post('/submit', relatorioController.fazerRelatorio);
router.get('/:id', relatorioController.listarRelatorioPorId);
router.get('/delete/:id', relatorioController.deletarRelatorio);

export default router;
