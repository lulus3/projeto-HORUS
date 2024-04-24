import express from 'express';
import epicamController from '../controle/epicamController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados das EPIs das Câmeras
router.get('/', epicamController.listarEpiCam);
router.post('/submit', epicamController.inserirEpiCamera);
router.get('/:id', epicamController.listarEpiCamPorId);
router.post('/update/:id', epicamController.editarEpiCam);
router.get('/delete/:id', epicamController.deletarEpiCam);

export default router;
