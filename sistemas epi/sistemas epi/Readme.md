# requerimentos node:
##    axios: 1.3.4
##    cors: 2.8.5
##    dotenv: 16.4.1
##    express: 4.18.2
##    msgpack: 1.0.3
##    socket.io: 4.6.1
##    socket.io-client: 4.7.4


# requerimentos python:
##    pytorch: 1.0+cu121
##    msgpack: 1.0.7
##    python-socketio: 5.3.0
##    python engineio: 4.1.0
##    open cv

# como rodar (no terminal):

###    node server1

rodar o servidor principal que se conecta ao servidor react

###    node server2

roda o servidor secundario que se conecta as cameras e as IA

###    python ia.py

rode a instancia da IA, cada instancia é capaz de processar 2 cameras, para cada par de cameras adicionadas se adiciona uma instancia de ia (lembre de trocar o numero do id da IA, começando pelo 1)

###    python cameras.py

roda as cameras, cada camera pega um periferico do computador (webcam), antes de rodar lembre-se de trocar o parametro de captura e os ids de cada camera para nao haver conflitos

###    python face_ia.py

roda a instancia da IA de reconhecimento facial

###    python ocorrencia.py 

roda o codigo do registrador de ocorrencias

obs: troque as variaveis de ambiente e as variavies do arquivo config.py para se adequar ao sua ocasiao


