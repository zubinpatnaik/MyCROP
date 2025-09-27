import tensorflow as tf
import numpy as np
import os

IMG_SIZE = (224, 224)

MODEL_PATH = 'D:\\Work\\Github\\rewindrecode\\Recode_Rewind_Bot_Coders\\Recode_Rewind_Bot_Coders\\crop_disease_model_10e.keras'

DATA_DIR ='D:\\Work\\Github\\rewindrecode\\Recode_Rewind_Bot_Coders\\Recode_Rewind_Bot_Coders\\backend\\dataset' 
UPLOAD_DIR = 'D:\\Work\\Github\\rewindrecode\\Recode_Rewind_Bot_Coders\\Recode_Rewind_Bot_Coders\\backend\\uploads' 
os.makedirs(UPLOAD_DIR, exist_ok=True)


try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

try:
    temp_dataset = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
        image_size=IMG_SIZE,
        batch_size=1, # Batch size doesn't matter here coz loading
        shuffle=False
    )
    class_names = temp_dataset.class_names
    print(f"Found class names: {class_names}")
except Exception as e:
    print(f"Error: Could not read class names from the directory {DATA_DIR}. {e}")
    exit()


def predict_image(image_path):

    img = tf.keras.utils.load_img(image_path, target_size=IMG_SIZE)    
    img_array = tf.keras.utils.img_to_array(img)
    img_batch = np.expand_dims(img_array, axis=0)
    img_preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(img_batch)
    
    prediction = model.predict(img_preprocessed, verbose=0)
    
    predicted_class_index = np.argmax(prediction[0])
    confidence = np.max(prediction[0]) * 100
    
    predicted_class_name = class_names[predicted_class_index]
    
    return predicted_class_name, confidence


print(f"\nScanning for images in '{UPLOAD_DIR}'")

image_files = [f for f in os.listdir(UPLOAD_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

if not image_files:
    print(f"No images found in '{UPLOAD_DIR}'")
else:
    print("Prediction Results")
    for image_file in image_files:
        full_path = os.path.join(UPLOAD_DIR, image_file)
        try:
            prediction, confidence = predict_image(full_path)
            print(f"Image: {image_file} -> Prediction: **{prediction}** (Confidence: {confidence:.2f}%)")
        except Exception as e:
            print(f"Could not process image {image_file}. Error: {e}")
