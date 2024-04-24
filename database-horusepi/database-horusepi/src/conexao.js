import mysql from 'mysql2'

// Criar a conexao com o banco de dados MySQL
const conexao = mysql.createConnection({
    host: 'localhost', 
    port:'3306',
    user: 'root',
    password: 'epicontroltech',
    database: 'EPICONTROLTECH',
})

// Estabelecer a conexao
conexao.connect()

export default conexao
