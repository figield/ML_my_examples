import numpy as np
import onnxruntime
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

model_path = "./model.onnx"
print(model_path)

# Initializing the ONNX Runtime session with the pre-trained model
sess = onnxruntime.InferenceSession(
    model_path,
    providers=["CPUExecutionProvider"],
)

urls = [
    "https://clubedemilhagem.com/home.php",
    "http://www.medicalnewstoday.com/articles/188939.php",
]
inputs = np.array(urls, dtype="str")

# Using the ONNX model to make predictions on the input data
results = sess.run(None, {"inputs": inputs})[1]

for url, proba in zip(urls, results):
    print(f"URL: {url}")
    print(f"Likelihood of being a phishing site: {proba[1] * 100:.2f} %")
    print("----")