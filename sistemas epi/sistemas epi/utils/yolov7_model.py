import torch
from torchvision import transforms
from utils.datasets import letterbox
from utils.general import non_max_suppression, scale_coords
import numpy as np
import json
import time
import cv2

class yolov7_model:
	def __init__(self,model_path,img_size = 640,stride = 64,conf_thres = 0.60,iou_thres = 0.50):
		self.conf_thres = conf_thres
		self.iou_thres = iou_thres
		self.img_size = img_size
		self.stride = stride
		self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
		self.half = self.device.type != "cpu"
		# Carregando modelo
		weigths = torch.load(model_path)
		self.model = weigths['model'].to(self.device)
		self.class_names = self.model.module.names if hasattr(self.model, 'module') else self.model.names
		# Carrergando modelo com a metada da precisão
		# Carrergando modelo com a metada da precisão
		if self.half:
			self.model = self.model.half()
		else:
			self.model = self.model.float()

	def processFrame(self,image):
		shape_im0 = image.shape
		image = letterbox(image, self.img_size, stride = self.stride, auto = True)[0]

		image = transforms.ToTensor()(image)
		image = torch.tensor(np.array([image.numpy()]))

		image = image.to(self.device)
		image = image.half() if self.half else image.float()
		with torch.no_grad():
			output = self.model(image)[0]
		output = non_max_suppression(output, self.conf_thres, self.iou_thres, classes=None, agnostic=False)
		detect = []
		j_detect = {}
		for i, det in enumerate(output):
			det[:, :4] = scale_coords(image.shape[2:], det[:, :4], shape_im0).round()
			detect = det.detach().cpu().numpy()[:,:6]
			j_detect[i] = detect.tolist()
		return json.dumps(j_detect)