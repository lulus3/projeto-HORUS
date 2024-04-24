import express from 'express';
import epiocorrenciaController from '../controle/epiocorrenciaController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados das EPIs das Ocorrências
router.get('/', epiocorrenciaController.listarEpiOcorrencia);
router.get('/:id', epiocorrenciaController.listarEpiOcorrenciaPorId);
router.get('/delete/:id', epiocorrenciaController.deletarEpiOcorrencia);

export default router;
