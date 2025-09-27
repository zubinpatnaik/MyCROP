import pandas as pd
import joblib
import os

# Load the saved model
MODEL_FILENAME = 'crop_price_model_xgboost_improved.pkl'
DATASET_FILENAME = 'combined_crop_data.xlsx'

if not os.path.exists(MODEL_FILENAME):
    print(f"Error: Model file '{MODEL_FILENAME}' not found. Ensure it is in the correct directory.")
    exit(1)

try:
    model = joblib.load(MODEL_FILENAME)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

# Load the dataset
if not os.path.exists(DATASET_FILENAME):
    print(f"Error: Dataset file '{DATASET_FILENAME}' not found. Ensure it is in the correct directory.")
    exit(1)

try:
    combined_df = pd.read_excel(DATASET_FILENAME)
    combined_df['Dates'] = pd.to_datetime(combined_df['Dates'], errors='coerce')  # Convert to datetime
except Exception as e:
    print(f"Error loading dataset: {e}")
    exit(1)

# Check for missing or corrupted data
if combined_df.isnull().sum().any():
    print("Warning: Dataset contains missing values. Some predictions may be inaccurate.")

# Create a mapping of crop names to their encoded values
if 'Crop' not in combined_df.columns or 'Price' not in combined_df.columns:
    print("Error: Dataset missing necessary columns ('Crop' or 'Price'). Check the data structure.")
    exit(1)

combined_df['Crop'] = combined_df['Crop'].astype(str).str.strip()
crop_mapping = combined_df['Crop'].astype('category')
crop_codes = crop_mapping.cat.codes
crop_name_to_code = dict(zip(crop_mapping, crop_codes))

print("\n✅ Available crops for prediction:", list(crop_name_to_code.keys()))

# Define the season function (same as in training)
def get_season(month):
    """Returns the season based on the month."""
    if month in [6, 7, 8, 9]:  # Monsoon in India
        return 1
    elif month in [12, 1, 2]:  # Winter
        return 2
    else:  # Summer
        return 3

# Function to validate and parse date input
def parse_date(date_str, date_name):
    try:
        date = pd.to_datetime(date_str, format='%Y-%m-%d', errors='coerce')
        if pd.isna(date):
            raise ValueError
        return date
    except ValueError:
        print(f"❌ Error: Invalid {date_name} format. Please use YYYY-MM-DD (e.g., 2025-03-26).")
        exit(1)

# Function to predict the price for a given crop and date
def predict_crop_price(crop_name, prediction_date):
    # Get the code for the crop
    crop_code = crop_name_to_code.get(crop_name)
    if crop_code is None:
        print(f"❌ Error: '{crop_name}' not found in the dataset. Available crops: {list(crop_name_to_code.keys())}")
        exit(1)

    # Get the most recent price for the crop as a proxy for 'Prev_Price'
    recent_prices = combined_df[combined_df['Crop'] == crop_name]['Price'].dropna()
    
    if recent_prices.empty:
        print(f"❌ Error: No historical price data available for {crop_name}. Prediction cannot be made.")
        exit(1)

    most_recent_price = recent_prices.iloc[-1]
    print(f"\n📌 Using the most recent {crop_name} price as a reference: ₹{most_recent_price:.2f}")

    # Prepare the new data point
    new_data = pd.DataFrame({
        'Year': [prediction_date.year],
        'Month': [prediction_date.month],
        'Day': [prediction_date.day],
        'DayOfWeek': [prediction_date.dayofweek],
        'Crop': [crop_code],
        'Season': [get_season(prediction_date.month)],
        'Prev_Price': [most_recent_price]
    })

    # Make the prediction
    predicted_price = model.predict(new_data)
    return predicted_price[0]

# Get user input
print("\n🔍 Enter details to predict the price of a crop:")
crop_name = input("🌾 Enter the crop name (e.g., Maize, Rice, Wheat): ").strip()
planting_date_str = input("🌱 Enter the planting date (YYYY-MM-DD, e.g., 2025-03-26): ").strip()
prediction_date_str = input("📅 Enter the date to predict the price (YYYY-MM-DD, e.g., 2025-09-26): ").strip()

# Parse and validate dates
planting_date = parse_date(planting_date_str, "planting date")
prediction_date = parse_date(prediction_date_str, "prediction date")

# Validate that prediction date is after planting date
if prediction_date <= planting_date:
    print("❌ Error: Prediction date must be after the planting date.")
    exit(1)

# Predict the price
try:
    predicted_price = predict_crop_price(crop_name, prediction_date)
    
    # Display the predicted price prominently
    print(f"\n🎯 ===== PREDICTED PRICE =====")
    print(f"📅 Date: {prediction_date.strftime('%Y-%m-%d')}")
    print(f"🌾 Crop: {crop_name}")
    print(f"💰 Predicted Price: ₹{predicted_price:.2f}")
    print(f"==========================\n")
except Exception as e:
    print(f"❌ Error during prediction: {str(e)}")
    exit(1)

# Show historical prices for the same month as context
prediction_month = prediction_date.month
month_name = prediction_date.strftime('%B')
historical_prices = combined_df[(combined_df['Crop'] == crop_name) & (combined_df['Dates'].dt.month == prediction_month)]['Price']

if not historical_prices.empty:
    print(f"📊 Historical Prices for {crop_name} in {month_name}:")
    print(f"⚠️ These are NOT predicted prices, but they help in understanding past trends.")
    print(historical_prices.describe().round(2))
else:
    print(f"⚠️ No historical data available for {crop_name} in {month_name}.")
