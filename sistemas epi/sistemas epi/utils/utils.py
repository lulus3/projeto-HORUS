import torch
import cv2


def labelDraw(image,detect,class_names, color_rec = (255, 255, 0), rec_width = 2, font = cv2.FONT_HERSHEY_COMPLEX_SMALL, width_font = 0.5, color_font = (0,0,0)):
	"""
	Método utilizado para alterar o frame de acordo com a detecção realizada
	"""
	objetos_detectados = []
	for det in detect:
		x,y,x2,y2 = det[:4]
		cv2.rectangle(image, (int(x) , int(y)), (int(x2) , int(y2)), color_rec, rec_width)
		objeto_detectado = class_names[int(det[5])]
		label = "Class {0}, conf {conf:.2f}".format(objeto_detectado,conf = det[4])
		objetos_detectados.append(objeto_detectado)
		cv2.putText(image,label,(int(x),int(y)),font,width_font,color_font)

	return objetos_detectados

def labelDrawOneDetect(image,det,label_classificado, color_rec = (255, 255, 0), rec_width = 2, font = cv2.FONT_HERSHEY_COMPLEX_SMALL, width_font = 1, color_font = (125,125,125)):
	"""
	Método utilizado para realizar a escrita da label apenas para um objeto detectado de cada vez
	"""
	x,y,x2,y2 = det[:4]
	cv2.rectangle(image, (int(x) , int(y)), (int(x2) , int(y2)), color_rec, rec_width)
	label = "Nome: {0}".format(label_classificado)
	cv2.putText(image,label,(int(x),int(y)),font,width_font,color_font)

def roi(imagem, det):
	"""
	Método utilizado para separar a região de interesse de um frame
	"""
	x,y,x2,y2 = det[:4]
	return imagem[int(y):int(y2),int(x):int(x2)]


def onImage(image,model):
	"""
	Método que recebe o modelo e o frama para retornar a detecção di ibheti
	"""
	image_display = image.copy()
	image_display = cv2.cvtColor(image_display, cv2.COLOR_BGR2RGB)
	detect = model.processFrame(image_display)
	
	return detect
def load_image(imagem,output_size):
    """Carrega uma imagem"""
    imagem = cv2.resize(imagem,output_size[:2])
    imagem = imagem.reshape(output_size[0],output_size[1],output_size[2])
    return imagem
def batch_image(dataset,output_size):
	"""
	Criação do dataset das imagens
	"""
	return dataset.reshape(-1,output_size[0],output_size[1],output_size[2])
