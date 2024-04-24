function converter(imagem_serializada){
    // Deserializar a imagem usando msgpack
    const frameData = msgpack.decode(new Uint8Array(imagem_serializada));

    // Converter os dados de imagem em um ArrayBuffer
    const frameArrayBuffer = new Uint8Array(frameData).buffer;

    // Criar um Blob a partir do ArrayBuffer
    const blob = new Blob([frameArrayBuffer], { type: 'image/jpeg' });

    // Criar uma URL do Blob e atribuir à tag <img>
    const imageUrl = URL.createObjectURL(blob);

    return imageUrl
}