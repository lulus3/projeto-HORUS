from utils.socket_video.detection_face import DetectionFaces
from utils.detector import *
from utils.socket_video.change_type_msgpack import *
from utils.socket_video.change_type_base64 import *
import socketio,cv2, time, config, os

class Client():
    def __init__(self, id, output = DetectionFaces()):
        self.socket = socketio.Client()
        self.output = output
        self.id = id
        self.fila = []
        self.recebidos = []
        self.apagados = []
        self.reset = False
        self.pasta = "Rostos"

        self.socket.connect(f'http://{config.ip_server2}:{config.port_server2}')
        self.socket.emit("conexao", f"a Ia {self.id} da face foi conectada #2")
        self.socket.on("face_ia", self.receber_dados)
        self.socket.on("image_data", self.receber_dados_armazenados)
        self.socket.on("deletar_foto", self.receber_dados_apagados)
        self.imagem_detecçao = cv2.imread("imagem.jpg")

        time.sleep(1)

        print("pronto para receber imagens")

    def run(self):
        try:
            while True:
                self.processar_imagem()
                self.armazenar_dados()
                self.apagar_dados()
        except KeyboardInterrupt:
            self.socket.disconnect()

    def receber_dados_armazenados(self, dados):
        self.recebidos.append(dados)
        print("imagem vinda para armazenamento")

    def armazenar_dados(self):
        # verifica os dados a serem armazenados usando uma fila FIFO para evitar a concorrencia ao acesso dos arquivos e diretorios
        if len(self.recebidos) > 0:
            self.reset = True
            dados = self.recebidos.pop(0)
            id = dados['id']
            arquivos = os.listdir(self.pasta)

            lista_arquivos_iguais = []
            for arquivo in arquivos:
                id_imagem, tipo = arquivo.split("_")
                if str(id) == str(id_imagem):
                    lista_arquivos_iguais.append(arquivo)

            # verifica e exclui as fotos mais antigas para manter apenas 3 fotos de cada perfil
            while len(lista_arquivos_iguais) >= 3:
                nome_imagem = lista_arquivos_iguais.pop(0)
                caminho_arquivo = os.path.join(self.pasta, nome_imagem)
                try:
                    os.remove(caminho_arquivo)
                    print(f"Arquivo removido com sucesso: {caminho_arquivo}")
                except OSError as e:
                    print(f"Erro ao remover o arquivo {caminho_arquivo}: {e}")

            # verifica qual numero a foto terá
            n = 1
            for imagem in lista_arquivos_iguais:
                caminho = os.path.join(self.pasta, imagem)
                print(caminho)
                os.rename(caminho, f'{self.pasta}/{id}_{n}.jpg')
                n += 1

            base64_data = dados['base64Data'].split(",")[1]
            imagem = base64_to_ndarray(base64_data)
            cv2.imwrite(f'{self.pasta}/{id}_{n}.jpg', imagem)
        
        # reseta a IA para que ela adicione ou retire os rotos conforme demanda
        if self.reset:
            self.output = DetectionFaces()
            self.reset = False
    
    def receber_dados_apagados(self, id):
        self.apagados.append(id)
        print("exclusao de imagem")

    def apagar_dados(self):
        # verifica os dados a serem apagados usando uma fila FIFO para evitar a concorrencia ao acesso dos arquivos e diretorios
        if len(self.apagados) > 0:
            id = self.apagados.pop(0)
            print(f"os dados referentes ao id {id} serao apagado")
            arquivos = os.listdir(self.pasta)
            for arquivo in arquivos:
                id_imagem, tipo = arquivo.split("_")
                if str(id) == str(id_imagem):
                    caminho_arquivo = os.path.join(self.pasta, arquivo)
                    try:
                        os.remove(caminho_arquivo)
                        print(f"Arquivo removido com sucesso: {caminho_arquivo}")
                    except OSError as e:
                        print(f"Erro ao remover o arquivo {caminho_arquivo}: {e}")
            self.output = DetectionFaces()

    def receber_dados(self, dados_recebidos):
        print('dados recebidos')
        dados = msgpack.unpackb(dados_recebidos)
        data = dados[1]
        base64_data = data.split(",")[1]
        image = base64_to_ndarray(base64_data)
        dados[1] = image
        self.fila.append(dados)

    def processar_imagem(self):
        if len(self.fila) > 0:
            dados_atual = self.fila[0]
            inicio = time.time()
            resultado = self.output.run(dados_atual[1])
            fim = time.time()
            print(f'tempo de processamento: {fim-inicio}')
            if resultado[0]:
                var = 1
            else:
                var = 0
            dados = {
                'result': var,
                'id': resultado[1],
            }
            dados_enviar = dados_to_msgpack([dados_atual[0], dados_to_msgpack(dados)])
            self.socket.emit("face_result", dados_enviar)
            self.fila.pop(0)
        return
    

