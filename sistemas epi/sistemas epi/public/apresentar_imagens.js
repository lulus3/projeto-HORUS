const iosocket = io()

iosocket.on('connect', () => {
    iosocket.emit('conexao', "a pagina das cameras foi conectada #0")
    iosocket.on('server_web', showImages)
})

function showImages(result, event) {

    const dados = msgpack.decode(new Uint8Array(result));

    // Extrair o ID e a imagem
    const id = dados.id;
    const imagemData = dados.imagem;
    const status = dados.status

    // converte a imagem para ser apresentada na tela
    imageUrl = converter(imagemData)

    var id_elemento = new String('img' + id)
    document.getElementById(id_elemento).src = imageUrl;
}