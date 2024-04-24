import conexao from '../conexao.js'

// Controlador para lidar com as operações relacionadas com os EPIs
const epiController = {
  // Operação para listar todos os EPIs
  listarEPI (req, res) {
    const sql = "SELECT * FROM epi;"
    conexao.query(sql, (error, result) => {
        if (error) {
            console.log(error)
            res.status(404).json({ 'Erro ao listar os EPIs': error})
        } else {
            res.status(200).json(result)
        }
    })
  },

  // Operação para inserir uma nova EPI
  inserirEPI (req, res) {
    const {id, nome} = req.body
    const sqlInsert = "INSERT INTO epi (id, nome) VALUES (?, ?)"
    conexao.query(sqlInsert, [id, nome], (error, result) => {
      if (error) {
        console.log(error)
        res.status(500).json({ 'Erro ao inserir novo EPI': error })
      } else {
        console.log('Inserção de novo EPI realizada com sucesso')
        res.status(200).json({ sucess: 'ok' })           
      }
    })
  },

  // Operação para listar uma EPI específica de acordo com seu ID
  listarEpiPorId (req, res) {
    const id = req.params.id
    const sql = "SELECT * FROM epi WHERE id=?"
    conexao.query(sql, id, (error, result) => {
      if (error){
        console.log(error)
        res.status(404).json({ 'Erro ao listar o EPI': error})
      } else {
        res.status(200).json(result[0])
      }
    })
  },

  // Operação para editar os dados de uma EPI
  editarEPI (req, res) {
    const id = req.params.id;
    const { nome } = req.body;
    const sqlUpdate = "UPDATE epi SET nome=? WHERE id=?";
    conexao.query(sqlUpdate, [tipo, nome], (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao atualizar o EPI' });
      } else {
        console.log('Edição concluída com sucesso')
        res.status(200).json({ sucess: 'ok' })
      }
    });
  },

  // Operação para excluir uma EPI
  deletarEPI (req, res) {
    const id = req.params.id
    const sqlDel = "DELETE FROM epi WHERE id=?"  
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel)
        res.status(404).json({ 'Erro ao excluir EPI': errorDel })
      } else {
        console.log('Epi excluído com sucesso')
        res.status(200).json({ sucess: 'ok' })
      }
    })
  }
}

export default epiController;
