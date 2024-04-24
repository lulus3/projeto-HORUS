const { Server } = require("socket.io");
const io = require("socket.io-client")
const cors = require("cors");
const http = require("http");
const msgpack = require("msgpack-lite");
require('dotenv').config();

const server = http.createServer();
const socket_server = new Server(server, {
  compress: true,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});

// conjuntos para armazenar as conexoes de cada tipo
const cameras = new Set();
const ia_epi = [];
const ia_face = new Set();

// conexao com o servidor principal
const socket_client = io("http://localhost:"+ process.env.PORT_SERVER1);

socket_client.on("connect", () => {
  socket_client.emit("conexao", "o servidor secundario foi conectado #2");
  socket_client.emit("atualizar_epis");
  socket_client.on("epis_requeridas", (mensagem) => {
    ia_epi.forEach((socket_id) => {
      socket_server.to(socket_id).emit("epis_requeridas", mensagem);
    });
  });

  socket_client.on("face_server", (frame) => {
    ia_face.forEach((socket_id) => {
      socket_server.to(socket_id).emit("face_ia", frame);
    });
  });

  socket_client.on("image_data", (imagem) => {
    ia_face.forEach((socket_id) => {
      socket_server.to(socket_id).emit("image_data", imagem);
    });
  });

  socket_client.on("deletar_foto", (id) => {
    ia_face.forEach((socket_id) => {
      socket_server.to(socket_id).emit("deletar_foto", id);
    });
  });
});

// Função que será executada quando o websocket iniciar
socket_server.on("connection", (socket) => {

  socket.on("conexao", (msg) => {
    let mensagem = msg.split("#")[0];
    let tipo = parseInt(msg.split("#")[1]);
    console.log(mensagem);
    if (tipo == 0){
      socket_client.emit("atualizar_epis");
      cameras.add(socket.id);
    }
    if (tipo == 1){
      ia_epi.push(socket.id);
      socket_client.emit("atualizar_epis");
    }
    if (tipo == 2)
      ia_face.add(socket.id);
  });

  socket.on("camera_server", (frame) => {
    let lista = msgpack.decode(frame);
    let id = parseInt(lista[0]);
    // separa as cameras em pares, cada instancia da ia fica com um par de cameras para processar
    ia_epi.forEach((socket_id, indice) => {
      if (id == (indice+1)*2 || id == (indice*2)+1)
      socket_server.to(socket_id).emit("server_ia", lista[1]);
    });
  });

  socket.on("face_result", (resultado) => {
    socket_client.emit("face_web", resultado);
  });

  socket.on("epis_requeridas", (mensagem) => {
    console.log("atualizaçao dos epis");
    ia_epi.forEach((socket_id) => {
      socket_server.to(socket_id).emit("epis_requeridas", mensagem);
    });
  });

  socket.on("ia_server", (frame) => {
    socket_client.emit("server_server", frame);
  })

  socket.on('disconnect', () => {
    cameras.delete(socket.id);
    ia_face.delete(socket.id);
    const socket_id = ia_epi.indexOf(socket.id);
    if (socket_id !== -1) {
      ia_epi.splice(socket_id, 1);
    }
    console.log("cliente desconecatdo");
  });

});

  
let porta = process.env.PORT_SERVER2
server.listen(porta, function(){
  console.log("o servidor foi iniciado em http://localhost:" + porta);
});
