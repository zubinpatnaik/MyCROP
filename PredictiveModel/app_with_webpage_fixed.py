import os
import logging
from pathlib import Path
from datetime import datetime, timedelta

import pandas as pd
import joblib
from flask import Flask, request, render_template_string
import matplotlib

# Use Agg backend for headless servers (must be set before pyplot import)
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Define base directory
BASE_DIR = Path(r"C:\Users\51ngh\OneDrive\Documents\GITHUB_Repo\Recode_Rewind_Bot_Coders\PredictiveModel")

MODEL_PATH = BASE_DIR / "crop_price_model_xgboost_citywise.pkl"
CROP_MAP_PATH = BASE_DIR / "crop_name_to_code.pkl"
CITY_MAP_PATH = BASE_DIR / "city_name_to_code.pkl"
COMBINED_DF_PATH = BASE_DIR / "combined_crop_data_citywise.xlsx"

app = Flask(__name__)

# Ensure static folder exists
static_folder = Path(app.static_folder or "static")
static_folder.mkdir(parents=True, exist_ok=True)

# Load artifacts safely
def safe_load_artifacts():
    try:
        logger.info(f"Loading model from: {MODEL_PATH}")
        model = joblib.load(str(MODEL_PATH))
        logger.info("Model loaded successfully.")
    except Exception as e:
        logger.exception("Failed to load model. Check MODEL_PATH and file integrity.")
        raise

    try:
        crop_name_to_code = joblib.load(str(CROP_MAP_PATH))
        city_name_to_code = joblib.load(str(CITY_MAP_PATH))
        logger.info("Loaded crop/city mappings successfully.")
    except Exception as e:
        logger.exception("Failed to load mapping files.")
        raise

    try:
        combined_df = pd.read_excel(str(COMBINED_DF_PATH))
        combined_df["Date"] = pd.to_datetime(combined_df["Date"])
        logger.info("Loaded combined dataset successfully.")
    except Exception as e:
        logger.exception("Failed to load combined dataset (Excel).")
        raise

    return model, crop_name_to_code, city_name_to_code, combined_df

model, crop_name_to_code, city_name_to_code, combined_df = safe_load_artifacts()

# Define the season function
def get_season(month: int) -> int:
    if month in [6, 7, 8, 9]:  # Monsoon
        return 1
    elif month in [12, 1, 2]:  # Winter
        return 2
    else:  # Summer
        return 3

# Function to validate and parse date input
def parse_date(date_str, date_name):
    try:
        return pd.to_datetime(date_str), None
    except Exception:
        return None, f"Invalid {date_name} format. Use YYYY-MM-DD (e.g., 2025-03-26)."

# Map cities to dominant soil types
city_to_soil = {
    "Mumbai": "alluvial",
    "Nagpur": "black",
    "Nashik": "red",
    "Pune": "black",
    "Raigad": "laterite",
    "Thane": "alluvial",
}

# Define soil-to-crop mapping
soil_crops = {
    "alluvial": ["Rice", "Wheat"],
    "red": ["Jowar", "Maize"],
    "black": ["Wheat", "Bengal Gram"],
    "laterite": [],
    "arid": ["Jowar"],
    "peaty": ["Rice"],
    "saline": ["Wheat"],
    "alkaline": ["Bengal Gram"],
}

# Define production costs (INR per quintal)
production_costs = {
    "Rice": 8000,
    "Wheat": 6000,
    "Bengal Gram": 7000,
    "Jowar": 5000,
    "Maize": 5500,
}

# Define crop weather sensitivities and recommendations
crop_weather_sensitivity = {
    "Rice": {
        "monsoon": "favorable",
        "winter": "unfavorable",
        "summer": "neutral",
        "monsoon_advice": "Favorable conditions for Rice due to heavy rainfall.",
        "winter_advice": "Cold weather may reduce yield. Consider delaying planting or using cold-resistant varieties.",
        "summer_advice": "Ensure proper irrigation as hot weather may dry out fields.",
    },
    "Wheat": {
        "monsoon": "unfavorable",
        "winter": "favorable",
        "summer": "unfavorable",
        "monsoon_advice": "Heavy rainfall may cause waterlogging. Avoid planting Wheat during Monsoon or ensure proper drainage.",
        "winter_advice": "Favorable conditions for Wheat due to cool, dry weather.",
        "summer_advice": "High temperatures may reduce yield. Plant early to avoid peak summer heat.",
    },
    "Bengal Gram": {
        "monsoon": "unfavorable",
        "winter": "favorable",
        "summer": "neutral",
        "monsoon_advice": "Excessive moisture may cause fungal diseases. Avoid planting Bengal Gram during Monsoon.",
        "winter_advice": "Favorable conditions for Bengal Gram due to cool, dry weather.",
        "summer_advice": "Monitor for heat stress and ensure adequate water.",
    },
    "Jowar": {
        "monsoon": "favorable",
        "winter": "neutral",
        "summer": "favorable",
        "monsoon_advice": "Favorable conditions for Jowar, but ensure proper drainage to avoid waterlogging.",
        "winter_advice": "Protect Jowar from cold snaps to maintain yield.",
        "summer_advice": "Favorable conditions for Jowar due to hot, dry weather.",
    },
    "Maize": {
        "monsoon": "favorable",
        "winter": "unfavorable",
        "summer": "neutral",
        "monsoon_advice": "Favorable conditions for Maize due to rainfall.",
        "winter_advice": "Cold weather may stunt growth. Consider delaying planting or using cold-resistant varieties.",
        "summer_advice": "Ensure proper irrigation to support Maize growth in hot weather.",
    },
}

# Function to predict weather and provide advice
def predict_weather_and_advice(crop_name, planting_date):
    month = planting_date.month
    season = get_season(month)
    season_name = {1: "monsoon", 2: "winter", 3: "summer"}[season]
    crop_weather = crop_weather_sensitivity.get(crop_name, {})
    weather_condition = crop_weather.get(season_name, "neutral")
    weather_advice = crop_weather.get(f"{season_name}_advice", "No specific weather advice available.")
    return weather_condition, weather_advice

# Function to generate a price trend graph
def generate_price_trend_graph(crop_name, city_name, combined_df):
    df = combined_df[(combined_df["Crop"] == crop_name) & (combined_df["City"] == city_name)].sort_values("Date")
    if df.empty:
        return None

    plt.figure(figsize=(10, 6))
    plt.plot(df["Date"], df["Price"], marker="o", linestyle="-", label=f"{crop_name} Price in {city_name}")
    plt.title(f"Historical Price Trend for {crop_name} in {city_name}")
    plt.xlabel("Date")
    plt.ylabel("Price (INR/quintal)")
    plt.grid(True)
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    graph_abs = Path(app.static_folder) / "price_trend.png"
    plt.savefig(str(graph_abs), bbox_inches="tight")
    plt.close()
    
    return f"/{Path(app.static_url_path.strip('/'))}/price_trend.png" if app.static_url_path else "/static/price_trend.png"

# Function to predict the price for a given crop, city, and date
def predict_crop_price(crop_name, city_name, prediction_date, planting_date):
    # Special case for Thane
    if city_name.lower() == "thane":
        return None, None, "Predictions for Thane are unavailable due to insufficient data."

    crop_code = crop_name_to_code.get(crop_name)
    city_code = city_name_to_code.get(city_name)
    
    if crop_code is None:
        return None, None, f"{crop_name} not found. Available crops: {list(crop_name_to_code.keys())}"
    if city_code is None:
        return None, None, f"{city_name} not found. Available cities: {list(city_name_to_code.keys())}"

    df_hist = combined_df[(combined_df["Crop"] == crop_name) & (combined_df["City"] == city_name)]
    if df_hist.empty:
        return None, None, f"No historical price data for {crop_name} in {city_name}."

    most_recent_price = float(df_hist.sort_values("Date")["Price"].iloc[-1])

    new_data = pd.DataFrame([{
        "Year": prediction_date.year,
        "Month": prediction_date.month,
        "Day": prediction_date.day,
        "DayOfWeek": prediction_date.dayofweek,
        "Crop": crop_code,
        "City": city_code,
        "Season": get_season(prediction_date.month),
        "Prev_Price": most_recent_price
    }])

    # Convert numeric columns to float for model compatibility
    for col in new_data.select_dtypes(include=["int64", "int32"]).columns:
        new_data[col] = new_data[col].astype(float)

    try:
        pred = model.predict(new_data)
        predicted_price = float(pred[0])
    except Exception as e:
        logger.exception("Model prediction failed.")
        return None, None, "Model prediction error: verify model and feature alignment."

    return predicted_price, most_recent_price, None

# HTML Template
HTML_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Crop Price Prediction</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1, h3 {
            text-align: center;
            color: #333;
        }
        label {
            display: block;
            margin-top: 10px;
            font-weight: bold;
        }
        input, select {
            width: 100%;
            padding: 8px;
            margin-top: 6px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 10px;
            margin-top: 12px;
            background: #28a745;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #218838;
        }
        #result, #suggestions, #weather {
            margin-top: 20px;
            padding: 12px;
            border-radius: 6px;
            background: #f9f9f9;
            border: 1px solid #ddd;
        }
        .profit-negative {
            color: red;
            font-weight: bold;
        }
        .profit-positive {
            color: green;
            font-weight: bold;
        }
        .weather-favorable {
            color: green;
        }
        .weather-unfavorable {
            color: red;
        }
        .weather-neutral {
            color: orange;
        }
        img {
            max-width: 100%;
            height: auto;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Crop Price Prediction System</h1>
        <form method="POST" action="/">
            <label for="city">Location (City):</label>
            <select id="city" name="city_name" required>
                <option value="">Select a city</option>
                {% for city in cities %}
                    <option value="{{ city }}" {% if city == city_name %}selected{% endif %}>{{ city }}</option>
                {% endfor %}
            </select>

            <label for="crop">Crop:</label>
            <select id="crop" name="crop_name" required>
                <option value="">Select a crop</option>
                {% for crop in crops %}
                    <option value="{{ crop }}" {% if crop == crop_name %}selected{% endif %}>{{ crop }}</option>
                {% endfor %}
            </select>

            <label for="yield_q">Expected Yield (in Quintals):</label>
            <input type="number" id="yield_q" name="yield_q" step="0.1" min="0" required value="{{ yield_amount if yield_amount is not none else '' }}">

            <label for="planting_date">Planting Date:</label>
            <input type="date" id="planting_date" name="planting_date" required value="{{ planting_date_str if planting_date_str else '' }}">

            <label for="prediction_date">Prediction Date:</label>
            <input type="date" id="prediction_date" name="prediction_date" required value="{{ prediction_date_str if prediction_date_str else '' }}">

            <button type="submit">Predict Price</button>
        </form>

        <div id="suggestions">
            {% if dominant_soil %}
                <h3>Dominant Soil Type: {{ dominant_soil|capitalize }}</h3>
                <p><strong>Suggested Crops for This Soil:</strong></p>
                {% if suggested_crops %}
                    <ul>
                        {% for s in suggested_crops %}
                            <li>{{ s.crop }}: {{ s.predicted_price }} INR/quintal (Predicted)</li>
                        {% endfor %}
                    </ul>
                {% else %}
                    <p>No suitable crops in our dataset for this soil type.</p>
                {% endif %}
            {% endif %}
        </div>

        <div id="weather">
            {% if weather_condition %}
                <h3>Weather Prediction for Planting</h3>
                <p><strong>Condition:</strong> <span class="weather-{{ weather_condition }}">{{ weather_condition|capitalize }}</span></p>
                <p><strong>Advice:</strong> {{ weather_advice }}</p>
            {% endif %}
        </div>

        <div id="result">
            {% if error %}
                <p style="color: red; font-weight: bold;">Error: {{ error }}</p>
            {% endif %}
            
            {% if predicted_price is not none %}
                <h3>Prediction Results for {{ crop_name }} in {{ city_name }}</h3>
                <p><strong>Predicted Price:</strong> {{ predicted_price }} INR/quintal</p>
                <p><strong>Adjusted Price (with 5% annualized inflation):</strong> {{ adjusted_price }} INR/quintal</p>
                <p><strong>Revenue (for {{ yield_amount }} quintals):</strong> {{ revenue }} INR</p>
                <p><strong>Production Cost (for {{ yield_amount }} quintals):</strong> {{ cost }} INR</p>
                <p><strong>Net Profit:</strong> <span class="{% if net_profit < 0 %}profit-negative{% else %}profit-positive{% endif %}">{{ net_profit }} INR</span></p>
                <p><strong>Storage Recommendation:</strong> {{ storage_recommendation }}</p>
                <p><strong>Most Recent Historical Price Used:</strong> {{ most_recent_price }} INR/quintal</p>

                <h4>Historical Prices for {{ prediction_month }}:</h4>
                <p><strong>Mean:</strong> {{ historical_mean }} INR/quintal | <strong>Min:</strong> {{ historical_min }} INR/quintal | <strong>Max:</strong> {{ historical_max }} INR/quintal</p>

                <h4>Recent Prices:</h4>
                <ul>
                    {% for price in recent_prices %}
                        <li>{{ price.Date }}: {{ price.Price }} INR/quintal</li>
                    {% endfor %}
                </ul>

                {% if graph_path %}
                    <h4>Price Trend Graph:</h4>
                    <img src="{{ graph_path }}" alt="Price Trend Graph">
                {% endif %}
            {% endif %}
        </div>
    </div>
</body>
</html>
"""

# Main route
@app.route("/", methods=["GET", "POST"])
def index():
    error = None
    predicted_price = None
    adjusted_price = None
    most_recent_price = None
    historical_mean = None
    historical_min = None
    historical_max = None
    prediction_month = None
    recent_prices = []
    dominant_soil = None
    suggested_crops = []
    crop_name = None
    city_name = None
    planting_date_str = None
    prediction_date_str = None
    yield_amount = None
    revenue = None
    cost = None
    net_profit = None
    storage_recommendation = None
    weather_condition = None
    weather_advice = None
    graph_path = None

    crops = list(crop_name_to_code.keys())
    cities = list(city_name_to_code.keys())

    if request.method == "POST":
        crop_name = request.form.get("crop_name")
        city_name = request.form.get("city_name")
        planting_date_str = request.form.get("planting_date")
        prediction_date_str = request.form.get("prediction_date")
        yield_str = request.form.get("yield_q")

        if not all([crop_name, city_name, planting_date_str, prediction_date_str, yield_str]):
            error = "All fields are required."
        else:
            try:
                yield_amount = float(yield_str)
                if yield_amount <= 0:
                    error = "Yield must be greater than 0."
            except Exception:
                error = "Yield must be a valid number."

            if not error:
                planting_date, err = parse_date(planting_date_str, "planting date")
                if err:
                    error = err
                prediction_date, err = parse_date(prediction_date_str, "prediction date")
                if err:
                    error = err

                if not error and prediction_date <= planting_date:
                    error = "Prediction date must be after the planting date."

                if not error:
                    # Weather advice
                    weather_condition, weather_advice = predict_weather_and_advice(crop_name, planting_date)

                    # Dominant soil & suggestions
                    dominant_soil = city_to_soil.get(city_name)
                    if dominant_soil:
                        suggested_crop_names = soil_crops.get(dominant_soil.lower(), [])
                        for suggested_crop in suggested_crop_names:
                            if suggested_crop != crop_name:
                                pred_price, _, e = predict_crop_price(suggested_crop, city_name, prediction_date, planting_date)
                                if not e and pred_price is not None:
                                    days_diff = (prediction_date - planting_date).days
                                    months_diff = days_diff / 30
                                    adjusted_pred_price = pred_price * (1 + 0.05 * (months_diff / 12))
                                    suggested_crops.append({
                                        "crop": suggested_crop,
                                        "predicted_price": round(adjusted_pred_price, 2)
                                    })

                    # Predict selected crop
                    predicted_price, most_recent_price, err = predict_crop_price(crop_name, city_name, prediction_date, planting_date)
                    if err:
                        error = err
                    else:
                        # Adjust for inflation (5% annualized simplified)
                        days_difference = (prediction_date - planting_date).days
                        months_difference = days_difference / 30
                        adjusted_price = predicted_price * (1 + 0.05 * (months_difference / 12))

                        production_cost = production_costs.get(crop_name, 6000)
                        revenue = adjusted_price * yield_amount
                        cost = production_cost * yield_amount
                        net_profit = revenue - cost

                        # Next month comparison for storage recommendation
                        next_month_date = prediction_date + timedelta(days=30)
                        next_month_price, _, _ = predict_crop_price(crop_name, city_name, next_month_date, planting_date)
                        if next_month_price is not None:
                            days_difference_next = (next_month_date - planting_date).days
                            months_difference_next = days_difference_next / 30
                            adjusted_next_month_price = next_month_price * (1 + 0.05 * (months_difference_next / 12))
                            price_difference = adjusted_next_month_price - adjusted_price
                            if price_difference > 0:
                                storage_recommendation = f"Store for one month to gain {round(price_difference, 2)} INR/quintal (expected {round(adjusted_next_month_price, 2)})."
                            else:
                                storage_recommendation = f"Sell now; price may drop by {round(-price_difference, 2)} INR/quintal (expected {round(adjusted_next_month_price, 2)})."
                        else:
                            storage_recommendation = "Unable to provide storage recommendation."

                        # Historical stats
                        prediction_month = prediction_date.strftime("%B")
                        hist = combined_df[
                            (combined_df["Crop"] == crop_name) &
                            (combined_df["City"] == city_name) &
                            (combined_df["Date"].dt.month == prediction_date.month)
                        ]["Price"]
                        
                        if not hist.empty:
                            s = hist.describe()
                            historical_mean = round(s.get("mean", 0), 2)
                            historical_min = round(s.get("min", 0), 2)
                            historical_max = round(s.get("max", 0), 2)
                        else:
                            historical_mean = historical_min = historical_max = 0

                        # Recent prices
                        recent_df = combined_df[
                            (combined_df["Crop"] == crop_name) &
                            (combined_df["City"] == city_name)
                        ].sort_values("Date", ascending=False).head(5)
                        
                        if not recent_df.empty:
                            recent_df = recent_df[["Date", "Price"]].copy()
                            recent_df["Date"] = recent_df["Date"].dt.strftime("%Y-%m-%d")
                            recent_prices = recent_df.to_dict("records")

                        # Generate graph
                        graph_path = generate_price_trend_graph(crop_name, city_name, combined_df)
                        
                        # Round values for display
                        predicted_price = round(predicted_price, 2)
                        adjusted_price = round(adjusted_price, 2)
                        most_recent_price = round(most_recent_price, 2)

    return render_template_string(
        HTML_TEMPLATE,
        error=error,
        predicted_price=predicted_price,
        adjusted_price=adjusted_price,
        most_recent_price=most_recent_price,
        historical_mean=historical_mean,
        historical_min=historical_min,
        historical_max=historical_max,
        prediction_month=prediction_month,
        recent_prices=recent_prices,
        crops=crops,
        cities=cities,
        dominant_soil=dominant_soil,
        suggested_crops=suggested_crops,
        crop_name=crop_name,
        city_name=city_name,
        prediction_date_str=prediction_date_str,
        planting_date_str=planting_date_str,
        yield_amount=yield_amount,
        revenue=round(revenue, 2) if revenue is not None else None,
        cost=round(cost, 2) if cost is not None else None,
        net_profit=round(net_profit, 2) if net_profit is not None else None,
        storage_recommendation=storage_recommendation if storage_recommendation else "Unable to provide storage recommendation.",
        weather_condition=weather_condition,
        weather_advice=weather_advice,
        graph_path=graph_path
    )

if __name__ == "__main__":
    # For development only. Use gunicorn/uwsgi in production.
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))