import conexao from '../conexao.js';

// Controlador para lidar com as operações relacionadas com as EPIs das Ocorrências
const epiocorrenciaController = {
  // Operação para listar todos os EPIs das Ocorrências
  listarEpiOcorrencia (req, res) {
    const sql= "SELECT * FROM epis_ocorrência;"
    conexao.query(sql, (error, result) => {
      if(error){
        console.log(error)
        res.status(404).json({ 'Erro as listar as EPIs das Ocorrências': error})
      } else{
        res.status(200).json(result)
      }
    })
  },

  // Operação para listar uma EPI de Ocorrência específica de acordo com seu ID
  listarEpiOcorrenciaPorId (req, res) {
    const id = req.params.id
    const sql = "SELECT * FROM epis_ocorrência WHERE id_ocorrencia=?"
    conexao.query(sql, id, (error, result) => {
      if (error) {
      console.log(error)
      res.status(404).json({ 'Erro ao listar EPI da Ocorrência': error})
      } else {
      res.status(200).json(result[0])
      }
    })
  },

  // Operação para excluir uma EPI de uma Ocorrência
  deletarEpiOcorrencia (req, res) {
    const id = req.params.id
    const sqlDel = "DELETE FROM epis_ocorrência WHERE id=?"
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel)
        res.status(404).json({ 'Erro ao excluir os EPIs das Ocorrências': errorDel })
      } else {
        console.log('EPIs da ocorrência excluídos com sucesso')
        res.status(200).json({ DadosExcluidos, message: 'Os dados foram excluídos'})
      }
    })
  }
};

export default epiocorrenciaController;
