# Crop Disease Classification using TensorFlow

This project uses a deep learning model, built with TensorFlow and Keras, to classify diseases in crop images. It leverages transfer learning with the **MobileNetV2** architecture for efficient training and accurate predictions.

---

## 📜 Project Structure

The project is organized into three main Python scripts:

* `preprocess.py`: Handles all data loading and preprocessing tasks. It reads images from the dataset directory, splits them into training and validation sets, and defines the data augmentation pipeline.
* `train.py`: Defines the model architecture using a pre-trained MobileNetV2 base. It compiles and trains the model on the preprocessed data and saves the final weights to a `.keras` file.
* `model_pred.py`: Loads the trained model to perform inference. It scans an `uploads` directory for images and prints the predicted disease class along with the confidence score for each image.

---

## ✨ Features

* **Framework**: Built entirely with **TensorFlow 2.x**.
* **Transfer Learning**: Uses a pre-trained **MobileNetV2** model with frozen base layers for rapid and effective feature extraction.
* **Data Augmentation**: Applies random horizontal/vertical flips and rotations to the training data to improve model generalization and reduce overfitting.
* **Modular Code**: Separate, easy-to-understand scripts for data handling, training, and prediction.

---

## ⚙️ Setup and Installation

Follow these steps to set up the project environment.

### 1. Prerequisites

* Python 3.8+
* pip (Python package installer)

### 2. Install Dependencies

Clone the repository and install the required Python packages.

```bash
# It is recommended to use a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install the required packages
pip install tensorflow numpy