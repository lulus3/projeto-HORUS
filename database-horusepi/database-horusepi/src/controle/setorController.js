import conexao from '../conexao.js'

// Controlador para lidar com as operações relacionadas ao Setor
const setorController = {
  // Operação para listar todos os Setores
  listarSetor (req, res) {
    const sql = "SELECT * FROM setor"
    conexao.query(sql, (error, result) => {
      if (error) {
      console.log(error)
      res.status(404).json({ 'Erro ao listar os Setores': error})
      } else {
      res.status(200).json(result)
      }
    })
  },

  // Operação para inserir um novo Setor
  inserirSetor (req, res) {
    const {nome} = req.body
    const sqlInsert = "INSERT INTO setor (nome) VALUES (?)"
    conexao.query(sqlInsert, [nome], (error, result) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'Erro ao inserir novo Setor' })
      } else {
        console.log('Inserção de novo Setor realizada com sucesso')
        res.status(200).json({sucess: 'ok'})      
      }
    })
  },

  // Operação para listar um Setor específico de acordo com seu ID
  listarSetorPorId (req, res) {
    const id = req.params.id
    const sql = "SELECT * FROM setor WHERE id=?"
    conexao.query(sql, id, (error, result) => {
      if (error) {
        console.log(error)
        res.status(404).json({ 'Erro ao listar Setor': error})
      } else {
        res.status(200).json(result[0])
      }
    })
  },

  // Operação para editar os dados de um Setor
  editarSetor (req, res) {
    const id = req.params.id;
    const { nome } = req.body;
    const sqlUpdate = "UPDATE setor SET nome=? WHERE id=?";
    conexao.query(sqlUpdate, [nome, id], (error, result) => {
      if (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao atualizar o Setor' });
      } else {
        console.log('Edição de Setor realizada com sucesso')
        res.status(200).json({ sucess: 'ok'})
      }
    });
  },

  // Operação para excluir um Setor
  deletarSetor (req, res) {
    const id = req.params.id
    const sqlDel = "DELETE FROM setor WHERE id=?"  
    conexao.query(sqlDel, [id], (errorDel, resultDel) => {
      if (errorDel) {
        console.log(errorDel)
        res.status(404).json({ 'Erro ao excluir Setor': errorDel })
      } else {
        console.log('Setor excluído com sucesso')
        res.status(200).json({ sucess: 'Ok'})
      }
    })
  }
};

export default setorController;
