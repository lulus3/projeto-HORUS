from utils.socket_video.client_ia import *
import os

Client(output = DetecYolo(endereco="classificadores/bestfinal.pt"),id='1').run()