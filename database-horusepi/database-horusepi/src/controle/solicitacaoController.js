import conexao from '../conexao.js';

// Controlador para llidar com as operações relacionadas as Solicitações
const solicitacaoController = {
  // Operação para listar todas as Solicitações
  listarSolicitacao (req, res) {
    const sql= "SELECT * FROM solicitação;"
    conexao.query(sql, (error, result) => {
      if(error){
        console.log(error)
        res.status(404).json({ 'Erro ao listar as Solicitações': error})
      } else{
        res.status(200).json(result)
      }
    })
  },

  // Operação para fazer uma Solicitação
  fazerSolicitacao (req, res) {
    const { id_cam, id_epi } = req.body;
    const sqlInsert = "INSERT INTO solicitação (id_cam, id_epi) VALUES (?, ?);";
    conexao.query(sqlInsert, [id_cam, id_epi], (error, result) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'erro' })
      } else {
        console.log('Inserção de nova Solicitação realizada com sucesso')
        res.status(200).json({ sucess: 'ok'})  
      }
    })
  },

  // Operação para listar um Solicitação específica de acordo com seu ID
  listarSolicitacaoPorId (req, res) {
    const id = req.params.id
    const sql = "SELECT * FROM solicitação WHERE id=?"
    conexao.query(sql, id, (error, result) => {
      if (error) {
      console.log(error)
      res.status(404).json({ 'Erro ao listar a Solicitação': error})
      } else {
      res.status(200).json(result[0])
      }
    })
  },

  // Operação para ecluir uma Solicitação
  deletarSolicitacao (req, res) {
    const id = req.params.id
    const sqlDel = "DELETE FROM solicitação WHERE id=?"
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel)
        res.status(404).json({ 'Erro ao excluir uma Solicitação': errorDel })
      } else {
        console.log('Solicitação excluída com sucesso')
        res.status(200).json({ sucess: 'ok'})
      }
    })
  }
};

export default solicitacaoController;
