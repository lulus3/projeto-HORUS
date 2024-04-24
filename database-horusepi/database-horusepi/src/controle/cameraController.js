import conexao from '../conexao.js';

// Controlador para lidar com as operações relacionadas com os dados das Câmeras
const cameraController = {
  // Operação para listar todas as Câmeras
  listarCameras (req, res) {
    const sqlCam = "SELECT * FROM câmeras;"
    conexao.query(sqlCam, (error, result) => {
      if(error){
      console.log(error)
      response.status(404).json({ 'erro': error})
      } else{
      res.status(200).json(result)
      }
    })
  },

  // Operação para inserir uma nova Câmera
  inserirCamera (req, res) {          
    const { id, nome, setor_locado } = req.body;
    const sqlInsert = "INSERT INTO câmeras (id, nome, setor_locado) VALUES (?, ?, ?);";
    conexao.query(sqlInsert, [id, nome, setor_locado], (error, result) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'Erro ao inserir nova Câmera' })
      } else {
        console.log('Inserção de câmera realizada com sucesso')
        res.status(200).json({ sucess: 'ok' })
      }
    })
  },

  // Operação para lista uma Câmera específica de acordo com seu ID
  listarCameraPorId (req, res) {
    const id = req.params.id
    const sql = "SELECT * FROM câmeras WHERE id=?;"
    conexao.query(sql, id, (error, result) => {
      if (error) {
      console.log(error)
      res.status(404).json({ error: 'Erro ao listar Câmera' })
      } else {
      res.status(200).json(result[0])
      }
    })
  },

  // Operação para editar os dados de uma Câmera
  editarCamera (req, res) {
    const id = req.params.id;
    const { nome, setor_locado } = req.body;
    const sqlUpdate = "UPDATE câmeras SET nome=?, setor_locado=? WHERE id=?";
    conexao.query(sqlUpdate, [nome, setor_locado, id], (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao atualizar a Câmera' });
      } else {
        console.log('Edição da Câmera realizada com sucesso')
        res.status(200).json({ message: 'Os dados foram atualizados' });
      }
    });
  },

  // Operação para excluir uma Câmera
  deletarCamera (req, res) {
    const id = req.params.id
    const sqlDel = "DELETE FROM câmeras WHERE id=?"
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel)
        res.status(404).json({ error: 'Erro ao excluir Câmera' })
      } else {
        console.log('Câmera excluída com sucesso')
        res.status(200).json({ DadosExcluidos, message: 'Os dados foram excluídos'})
      }
    })
  }
};

export default cameraController;
