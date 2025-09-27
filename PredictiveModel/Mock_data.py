import pandas as pd
import numpy as np

# Generate mock data for 4 crops
np.random.seed(42)
months = 8 * 12  # 8 years = 96 months
dates = pd.date_range(start='2017-01-01', periods=months, freq='M')

# Mock price data for each crop
corn_prices = 3.5 + 1.5 * np.sin(np.linspace(0, 4 * np.pi, months)) + np.random.normal(0, 0.2, months)
soybean_prices = 9.0 + 2.0 * np.sin(np.linspace(0, 4 * np.pi, months)) + np.random.normal(0, 0.5, months)
wheat_prices = 5.0 + 1.0 * np.sin(np.linspace(0, 2 * np.pi, months)) + np.random.normal(0, 0.3, months)
cotton_prices = 0.7 + 0.2 * np.sin(np.linspace(0, 3 * np.pi, months)) + np.random.normal(0, 0.05, months)

# Create DataFrames for each crop
crops_data = {
    'CORN': pd.DataFrame({'Date': dates, 'Price': corn_prices}),
    'SOYBEANS': pd.DataFrame({'Date': dates, 'Price': soybean_prices}),
    'WHEAT': pd.DataFrame({'Date': dates, 'Price': wheat_prices}),
    'COTTON': pd.DataFrame({'Date': dates, 'Price': cotton_prices}),
}

# Save each crop's data to a separate CSV file
for crop, df in crops_data.items():
    df.to_csv(f'{crop.lower()}_prices.csv', index=False)
    print(f"Mock data for {crop} saved to {crop.lower()}_prices.csv")
    print(df.head())