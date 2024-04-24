import express from 'express';
import cameraController from '../controle/cameraController.js';

// Criar instância do roteador do Express
const router = express.Router();

// Definindo rotas para manipulação dos dados das Câmeras
router.get('/', cameraController.listarCameras);
router.post('/submit', cameraController.inserirCamera);
router.get('/:id', cameraController.listarCameraPorId);
router.post('/update/:id', cameraController.editarCamera);
router.get('/delete/:id', cameraController.deletarCamera);

export default router;
