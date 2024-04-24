import cv2, datetime, socketio, config, os, msgpack, config
from utils.socket_video.change_type_msgpack import *
from threading import Thread
from moviepy.editor import ImageSequenceClip

class Gravador():
    def __init__(self) -> None:
        self.socket = socketio.Client()
        self.qtd_cameras = config.quantidade_cameras
        self.video = []
        self.minutos_video_incompleto = []
        self.nomes_video_incompleto = []
        self.nome_atual = []
        self.ultima_data: list[datetime.datetime] = []
        self.result = []
        self.fila = []
        self.diretorio = "public/gravaçao/camera_"
        self.formato = ".mp4"
        self.frame_rate = 10
        self.video_size = (854, 480)
        self.codec = "libx264"
        data_atual = datetime.datetime.now()
        
        # verifica se o minuto inicial esta na primeira ou na segunda metado do horario atual
        if data_atual.minute < 30:
            minuto = 0
        else:
            minuto = 30
        self.data_atual = datetime.datetime(year=data_atual.year, month=data_atual.month, day=data_atual.day,
                                            hour=data_atual.hour, minute=minuto, second=0)
        data_video = data_atual.strftime("%Y-%m-%d_%H;%M;%S")
        
        for i in range(self.qtd_cameras):
            self.nomes_video_incompleto.append([])
            self.result.append([])

            self.video.append(data_atual.minute // 5)
            self.minutos_video_incompleto.append((data_atual.minute // 5) * 5)

            diretorio_armazenamento = f"{self.diretorio}{i}"
            if not(os.path.exists(diretorio_armazenamento)):
                os.makedirs(diretorio_armazenamento)
            self.nome_atual.append(f"{diretorio_armazenamento}/{data_video}")
            self.nomes_video_incompleto[i].append(f"{self.nome_atual[i]}#{self.video[i]}")

            self.ultima_data.append(self.data_atual)
            print(self.nome_atual[i])
            print(self.nomes_video_incompleto[i][0])

            self.result[i] = {
                'video_principal': [],
                'video_secundario': [],
                'principal_inicio': data_atual,
                'secundario_inicio': data_atual,
                'id_cam': i+1
            }
            
        try:
            self.socket.connect("http://" + config.ip_server1 + ":" + str(config.port_server1))
        except Exception as e:
            print(f"Erro ao conectar à gravaçao: {e}")
            return
        self.socket.emit("conexao", f"a gravaçao foi conectada #3")
        self.socket.on("gravacao", self.receive)
    
    def run(self) -> None:
        try:
            while True:
                self.process_camera()
                self.apagar_arquivos()
        except KeyboardInterrupt:
            self.socket.disconnect()
            print('terminou')
            data = datetime.datetime.now()
            for i in range(self.qtd_cameras):
                self.mudar_codec(f"{self.nome_atual[i]}{self.formato}", self.result[i]['video_principal'].copy(), self.result[i]['principal_inicio'],data, i+1, 2)
                self.mudar_codec(f"{self.nomes_video_incompleto[id][-1]}{self.formato}", self.result[id]['video_secundario'].copy(), self.result[i]['secundario_inicio'],data, i+1, 1)
            
            cv2.destroyAllWindows() 
        
    def receive(self, dados_serilizados) -> None:
        # recebe os arquivos e adiciona na fila de processamento
        dados = msgpack.unpackb(dados_serilizados)
        self.fila.append(dados)

    def process_camera(self) -> None:
        # processa os frames recebidos pegando de uma fila de processamento FIFO para não haver problemas de concorrencia
        if len(self.fila) > 0:
            dados = self.fila.pop(0)
            dados_data = dados['data'].split("-")
            dados_horario = dados['horario'].split(":")
            ano_frame, mes_frame, dia_frame = int(dados_data[0]), int(dados_data[1]), int(dados_data[2])
            hora_frame, minuto_frame, segundo_frame = int(dados_horario[0]), int(dados_horario[1]), int(dados_horario[2])
            data_frame = datetime.datetime(year=ano_frame, month=mes_frame, day=dia_frame, hour=hora_frame, minute=minuto_frame, second=segundo_frame)
            id = (int(dados['id']) - 1)

            # fecha o segmento de 30 minutos, atualiza as variaveis para trabalhar com o novo segmento
            if hora_frame != self.ultima_data[id].hour or not(self.ultima_data[id].minute <= minuto_frame <= (self.ultima_data[id].minute + 29)):
                print(f"o horario ficou diferente horario do frame: {hora_frame}:{minuto_frame}, ultimo horario registrado: {self.ultima_data[id].hour}:{self.ultima_data[id].minute}")
                if minuto_frame < 30:
                    minuto = 0
                else:
                    minuto = 30

                nova_data = datetime.datetime(year=ano_frame, month=mes_frame, day=dia_frame, hour=hora_frame, minute=minuto, second=0)

                self.minutos_video_incompleto[id] = (minuto_frame // 5) * 5
                self.video[id] = minuto_frame // 5
                
                thread_video_transform1 = Thread(
                    target=self.mudar_codec(f"{self.nome_atual[id]}{self.formato}", self.result[id]['video_principal'].copy(),
                                            self.result[id]['principal_inicio'], nova_data, id+1, 2))
                thread_video_transform1.start()
                
                self.result[id]['video_principal'].clear()
                self.result[id]['video_secundario'].clear()
                self.result[id]['principal_inicio'] = nova_data
                self.result[id]['secundario_inicio'] = nova_data
                
                caminho_da_pasta = f"{self.diretorio}{id}"
                if os.path.isdir(caminho_da_pasta):
                    arquivos = os.listdir(caminho_da_pasta)

                    for arquivo in arquivos:
                        if "#" in  arquivo:
                            caminho_arquivo = os.path.join(caminho_da_pasta, arquivo)
                            try:
                                os.remove(caminho_arquivo)
                                print(f"Arquivo removido com sucesso: {caminho_arquivo}")
                            except OSError as e:
                                print(f"Erro ao remover o arquivo {caminho_arquivo}: {e}")
                                
                self.nomes_video_incompleto[id].clear()

                self.ultima_data[id] = nova_data
                data_video = nova_data.strftime("%Y-%m-%d_%H;%M;%S")

                diretorio_armazenamento = f"{self.diretorio}{id}"
                self.nome_atual[id] = f"{diretorio_armazenamento}/{data_video}"
                self.nomes_video_incompleto[id].append(f"{self.nome_atual[id]}#{self.video[id]}")

            # escreve os frames no video se eles estiverem de acordo com o ultimo horario atulizado de cada camera
            if hora_frame == self.ultima_data[id].hour and self.ultima_data[id].minute <= minuto_frame <= (self.ultima_data[id].minute + 29):
                frame = msgpack_to_ndarray(dados['imagem'])
                new_frame = cv2.resize(frame, self.video_size)
                new_frame = cv2.cvtColor(new_frame, cv2.COLOR_BGR2RGB)
                self.result[id]['video_principal'].append(new_frame)
                self.result[id]['video_secundario'].append(new_frame)

            # reinicia um novo video caso o segmento menor esteja completo
            if not(self.minutos_video_incompleto[id] <= minuto_frame <= (self.minutos_video_incompleto[id] + 4)):
                print(f"hora de troca o segmento menor, minuto do frame: {minuto_frame}, ultimo minuto registrado: {self.minutos_video_incompleto[id]}")
                self.nomes_video_incompleto[id].append(f"{self.nome_atual[id]}#{self.video[id]}")

                thread_video_transform2 = Thread(
                    target=self.mudar_codec(f"{self.nomes_video_incompleto[id][-1]}{self.formato}", self.result[id]['video_secundario'].copy(),
                                            self.result[id]['secundario_inicio'], data_frame, id+1, 1)
                )
                thread_video_transform2.start()

                self.video[id] += 1
                self.minutos_video_incompleto[id] += 5
                

                self.result[id]['video_secundario'].clear()
                self.result[id]['secundario_inicio'] = data_frame


    def apagar_arquivos(self) -> None:
        # Verificar se o caminho é um diretório
        horario_atual = datetime.datetime.now()
        for i in range(self.qtd_cameras):
            caminho_da_pasta = f"{self.diretorio}{i}"
            if os.path.isdir(caminho_da_pasta):
                # Listar os arquivos na pasta
                arquivos = os.listdir(caminho_da_pasta)

                # Exibir os nomes dos arquivos
                for arquivo in arquivos:
                    data, horario = arquivo.split("_")
                    ano, mes, dia = data.split("-")
                    hora, minuto, segundo = horario.split(";")
                    data_recebida = datetime.datetime(year=int(ano), month=int(mes), day=int(dia), hour=int(hora), minute=int(minuto), second=0)
                    diferenca = abs(data_recebida - horario_atual)
                    if diferenca > datetime.timedelta(days=1):
                        caminho_arquivo = os.path.join(caminho_da_pasta, arquivo)
                        try:
                            os.remove(caminho_arquivo)
                            print(f"Arquivo removido com sucesso: {caminho_arquivo}")
                        except OSError as e:
                            print(f"Erro ao remover o arquivo {caminho_arquivo}: {e}")
    
    def mudar_codec(self, nome_arquivo, video_clipe, data_inicio: datetime.datetime, data_fim: datetime.datetime, id, tipo):
        # o video sera gravado se houver um minimo de 270 frame, ou seja, cerca de 30 segundos
        if len(video_clipe) > 270:
            video = ImageSequenceClip(video_clipe, fps=self.frame_rate)
            video.write_videofile(nome_arquivo, codec=self.codec)
            print(f"codec do arquivo mudado: {nome_arquivo}")
            dados = {
                'id_cam': id,
                'epis': [],
                'data_ocorrencia': f"{data_inicio.year}-{data_inicio.month}-{data_inicio.day}",
                'horario_inicio': f"{data_inicio.hour}:{data_inicio.minute}:{data_inicio.second}",
                'horario_fim': f"{data_fim.hour}:{data_fim.minute}:{data_fim.second}",
                'tipo': tipo
            }
            dados_enviar = msgpack.packb(dados)
            # envia o video como ocorrencia para ser armazenado no banco de dados
            self.socket.emit("registrar_ocorrencia", dados_enviar)

process = Gravador()
process.run()