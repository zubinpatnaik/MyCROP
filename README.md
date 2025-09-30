# MyCROP - Crop Disease Detection & Price Prediction Platform

## 🌾 Project Overview

MyCROP is a comprehensive agricultural platform that combines machine learning-powered crop disease detection with intelligent price prediction to help farmers make informed decisions. The platform features a modern web interface for crop monitoring, disease diagnosis, and market analysis across multiple Indian cities.

## ✨ Key Features

### 🔬 Crop Disease Detection
- **Deep Learning Model**: Trained MobileNetV2-based CNN for accurate crop disease identification
- **Image Classification**: Real-time analysis of crop field photos to detect diseases
- **High Accuracy**: 100-epoch trained model with data augmentation for robust performance

### 📈 Price Prediction
- **XGBoost Model**: Machine learning-driven crop price forecasting
- **Multi-City Support**: Price predictions for Mumbai, Delhi, Pune, Nashik, Nagpur, Thane, and Raigad
- **Crop Variety**: Supports Maize, Rice, Wheat, Jowar (Sorghum), and Bengal Gram
- **Temporal Analysis**: Historical data from 2016-2025 for accurate trend prediction

### 🌐 Interactive Web Interface
- **Responsive Dashboard**: Modern, mobile-friendly UI built with Tailwind CSS
- **Real-time Weather**: Local weather information for farming decisions
- **Market Ticker**: Live crop price updates across different markets
- **Data Visualization**: Interactive charts and graphs for price trends

## 🏗️ Architecture

### Backend Components
- **Disease Detection API** (`backend/`): TensorFlow-based image classification service
- **Price Prediction Service** (`PredictiveModel/`): XGBoost-powered forecasting engine
- **Data Processing**: Excel/CSV data handling and preprocessing pipelines

### Frontend Components
- **Dashboard** (`main.html`): Comprehensive farm management interface
- **Crop Monitoring** (`my-crops.html`): Personal crop tracking and health monitoring
- **Market Prices** (`crops.html`): Real-time market data and price trends
- **Responsive Design**: Mobile-first approach with modern CSS frameworks

## 🛠️ Technology Stack

### Machine Learning & Data Science
- **TensorFlow 2.15+**: Deep learning framework for disease detection
- **XGBoost 2.0**: Gradient boosting for price prediction
- **Pandas & NumPy**: Data manipulation and analysis
- **Scikit-learn**: ML utilities and preprocessing

### Web Technologies
- **Flask 3.0**: Python web framework for API services
- **HTML5/CSS3**: Modern web standards
- **JavaScript (ES6+)**: Interactive frontend functionality
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization library

### Data Formats
- **Excel/CSV**: Market data storage and processing
- **Keras Models**: Trained neural network persistence
- **Pickle**: Model serialization and deployment

## 📁 Project Structure

```
MyCROP/
├── backend/                    # Disease detection service
│   ├── model_pred.py          # Image prediction API
│   ├── train.py               # Model training script
│   ├── preprocess.py          # Data preprocessing
│   ├── requirements.txt       # Python dependencies
│   └── uploads/               # Image upload directory
├── frontend/                  # Web interface
│   ├── main.html              # Dashboard page
│   ├── crops.html             # Market prices page
│   ├── my-crops.html          # Crop monitoring page
│   ├── *.js                   # JavaScript modules
│   └── global.css             # Styling
├── PredictiveModel/           # Price prediction service
│   ├── app.py                 # Flask API
│   ├── Prediction_script.py   # Core prediction logic
│   ├── Dataset_API.py         # Data aggregation
│   └── dataset/               # Historical market data
└── crop_disease_model_100e.keras  # Trained CNN model
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zubinpatnaik/MyCROP.git
   cd MyCROP
   ```

2. **Set up virtual environment** (recommended)
   ```bash
   python -m venv mycrop_env
   # Windows
   mycrop_env\Scripts\activate
   # Linux/Mac
   source mycrop_env/bin/activate
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Install prediction model dependencies**
   ```bash
   cd PredictiveModel
   pip install -r requirements.txt
   cd ..
   ```

### Configuration

1. **Update file paths** in the following files to match your system:
   - `backend/model_pred.py`: Update `MODEL_PATH`, `DATA_DIR`, and `UPLOAD_DIR`
   - `backend/preprocess.py`: Update `DATA_DIR` path
   - `PredictiveModel/app_with_webpage.py`: Update `BASE_DIR` path

2. **Prepare the dataset**
   - Ensure crop disease images are organized in `backend/dataset/` by class folders
   - Market data should be available in `PredictiveModel/dataset/` organized by city

## 🎯 Usage

### Disease Detection Service

1. **Start the disease detection backend**
   ```bash
   cd backend
   python model_pred.py
   ```

2. **Use the prediction function**
   ```python
   from model_pred import predict_image
   
   # Predict disease from image
   disease, confidence = predict_image('path/to/crop_image.jpg')
   print(f"Predicted: {disease} with {confidence:.2f}% confidence")
   ```

### Price Prediction Service

1. **Start the Flask application**
   ```bash
   cd PredictiveModel
   python app.py
   ```

2. **Make prediction requests**
   ```bash
   curl -X POST http://localhost:5000/predict \
   -H "Content-Type: application/json" \
   -d '{
     "crop_name": "Rice",
     "planting_date": "2025-01-15",
     "prediction_date": "2025-06-15"
   }'
   ```

### Web Interface

1. **Open the frontend**
   - Navigate to the `frontend/` directory
   - Open `main.html` in a web browser
   - Or serve with a local web server for full functionality

2. **Features available**:
   - **Dashboard**: Overview of crop health, weather, and market trends
   - **My Crops**: Upload and monitor your crop images for disease detection
   - **Crop Prices**: View current market prices and historical trends

## 🧪 Model Training

### Disease Detection Model

```bash
cd backend
python train.py
```

The training script will:
- Load and preprocess crop disease images
- Apply data augmentation (rotation, flipping)
- Train MobileNetV2-based CNN for 100 epochs
- Save the trained model as `crop_disease_model_100e.keras`

### Price Prediction Model

The XGBoost model is trained on historical market data with features including:
- Crop type and city encoding
- Seasonal patterns (monsoon, winter, summer)
- Historical price trends
- Date-based features (month, year, day of year)

## 📊 Data Sources

### Market Data
- **Coverage**: 6 cities in Maharashtra (Mumbai, Pune, Nashik, Nagpur, Thane, Raigad)
- **Crops**: Maize, Rice, Wheat, Jowar (Sorghum), Bengal Gram
- **Timeline**: 2016-2025 historical and projected data
- **Format**: Excel files with date, price, and market information

### Disease Detection Dataset
- **Images**: Crop disease photos organized by class
- **Format**: Standard image formats (JPG, PNG)
- **Classes**: Various crop diseases and healthy crop conditions

## 🔧 API Reference

### Disease Detection API
```python
predict_image(image_path: str) -> tuple[str, float]
```
- **Input**: Path to crop image file
- **Output**: (predicted_disease, confidence_percentage)

### Price Prediction API
```http
POST /predict
Content-Type: application/json

{
  "crop_name": "Rice",
  "planting_date": "2025-01-15", 
  "prediction_date": "2025-06-15"
}
```

**Response:**
```json
{
  "crop_name": "Rice",
  "prediction_date": "2025-06-15",
  "predicted_price": 2847.32
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Zubin Patnaik** - [@zubinpatnaik](https://github.com/zubinpatnaik)

## 🙏 Acknowledgments

- TensorFlow team for the excellent deep learning framework
- XGBoost developers for the powerful gradient boosting library
- Agricultural data providers for market information
- Open source community for various tools and libraries used

## 📞 Support

For support, email or open an issue in the GitHub repository.

---

**MyCROP** - Empowering farmers with AI-driven insights for better crop management and market decisions. 🌾🤖