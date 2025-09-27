import tensorflow as tf

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
DATA_DIR = 'D:\\Work\\Code\\Python\\Models\\crop_disease\\backend\\dataset'

def get_datasets():
    train_dataset = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE)

    validation_dataset = tf.keras.utils.image_dataset_from_directory(
        DATA_DIR,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE)

    return train_dataset, validation_dataset, train_dataset.class_names

def get_data_augmentation_layer():
    return tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.2),
    ])