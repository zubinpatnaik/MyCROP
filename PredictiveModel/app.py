from flask import Flask, request, jsonify
from Prediction_script import predict_crop_price
import pandas as pd

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        data = request.get_json()

        # Extract crop name, planting date, and prediction date
        crop_name = data.get('crop_name')
        planting_date_str = data.get('planting_date')
        prediction_date_str = data.get('prediction_date')

        # Validate input
        if not crop_name or not planting_date_str or not prediction_date_str:
            return jsonify({'error': 'Missing required input fields'}), 400

        # Convert string dates to datetime format
        planting_date = pd.to_datetime(planting_date_str)
        prediction_date = pd.to_datetime(prediction_date_str)

        # Ensure prediction date is after planting date
        if prediction_date <= planting_date:
            return jsonify({'error': 'Prediction date must be after planting date'}), 400

        # Get the predicted price
        predicted_price = predict_crop_price(crop_name, prediction_date, planting_date)

        # Return response
        return jsonify({'crop_name': crop_name, 'prediction_date': prediction_date_str, 'predicted_price': predicted_price})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
