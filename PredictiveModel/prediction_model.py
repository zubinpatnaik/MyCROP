import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib


combined_df = pd.read_excel('combined_crop_data_citywise.xlsx')
combined_df['Date'] = pd.to_datetime(combined_df['Date'])
print("Loaded combined dataset with City column:\n", combined_df.head())


print("Missing values before cleaning:\n", combined_df.isnull().sum())

combined_df = combined_df.dropna(subset=['Date', 'Crop', 'City'])

combined_df['Price'] = combined_df.groupby(['Crop', 'City'])['Price'].transform(lambda x: x.fillna(x.mean()))

combined_df = combined_df.dropna(subset=['Price'])


combined_df = combined_df[combined_df['Price'] >= 1000]

combined_df = combined_df.reset_index(drop=True)


for crop in combined_df['Crop'].unique():
    crop_mask = combined_df['Crop'] == crop
    q1 = combined_df[crop_mask]['Price'].quantile(0.25)
    q3 = combined_df[crop_mask]['Price'].quantile(0.75)
    iqr = q3 - q1
    upper_bound = q3 + 1.5 * iqr
    lower_bound = q1 - 1.5 * iqr
    combined_df = combined_df[~((crop_mask) & ((combined_df['Price'] > upper_bound) | (combined_df['Price'] < lower_bound)))]

    crop_mask = combined_df['Crop'] == crop
    print(f"Removed outliers for {crop}. New price range: {combined_df[crop_mask]['Price'].min()} to {combined_df[crop_mask]['Price'].max()}")

print("Missing values after cleaning:\n", combined_df.isnull().sum())
print("Price statistics (all crops):\n", combined_df['Price'].describe())
print("Cleaned data:\n", combined_df.head())


print("Maize price statistics after cleaning:\n", combined_df[combined_df['Crop'] == 'Maize']['Price'].describe())


print("\nData points per city:")
print(combined_df['City'].value_counts())


print("\nChecking for data gaps:")
for city in combined_df['City'].unique():
    for crop in combined_df['Crop'].unique():
        subset = combined_df[(combined_df['City'] == city) & (combined_df['Crop'] == crop)].sort_values('Date')
        date_diffs = subset['Date'].diff().dt.days
        if date_diffs.max() > 1:
            print(f"Data gaps for {crop} in {city}: Max gap = {date_diffs.max()} days")


combined_df['Year'] = combined_df['Date'].dt.year
combined_df['Month'] = combined_df['Date'].dt.month
combined_df['Day'] = combined_df['Date'].dt.day
combined_df['DayOfWeek'] = combined_df['Date'].dt.dayofweek

def get_season(month):
    if month in [6, 7, 8, 9]:  # Monsoon in India
        return 1
    elif month in [12, 1, 2]:  # Winter
        return 2
    else:  # Summer (includes March)
        return 3

combined_df['Season'] = combined_df['Month'].apply(get_season)


combined_df = combined_df.sort_values(['Crop', 'City', 'Date'])
combined_df['Prev_Price'] = combined_df.groupby(['Crop', 'City'])['Price'].shift(1)
combined_df['Prev_Price'] = combined_df.groupby(['Crop', 'City'])['Prev_Price'].ffill()
combined_df = combined_df.dropna()

crop_mapping = combined_df['Crop'].astype('category')
crop_codes = crop_mapping.cat.codes
crop_name_to_code = dict(zip(crop_mapping, crop_codes))
print("Crop name to code mapping:", crop_name_to_code)

city_mapping = combined_df['City'].astype('category')
city_codes = city_mapping.cat.codes
city_name_to_code = dict(zip(city_mapping, city_codes))
print("City name to code mapping:", city_name_to_code)

combined_df['Crop'] = crop_codes
combined_df['City'] = city_codes

print("Data after feature engineering:\n", combined_df.head())


X = combined_df[['Year', 'Month', 'Day', 'DayOfWeek', 'Crop', 'City', 'Season', 'Prev_Price']]
y = combined_df['Price']
print("Features shape:", X.shape)
print("Target shape:", y.shape)


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("Training features shape:", X_train.shape)
print("Testing features shape:", X_test.shape)

model = XGBRegressor(
    n_estimators=100,
    random_state=42,
    learning_rate=0.05,
    max_depth=4,
    reg_lambda=1.0,
    reg_alpha=0.1
)
model.fit(X_train, y_train)
train_score = model.score(X_train, y_train)
print("Training R^2 score:", train_score)


y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print("Test Mean Squared Error:", mse)
print("Test R^2 score:", r2)


print("\nModel Performance by City:")
for city in city_name_to_code.keys():
    city_code = city_name_to_code[city]
    city_mask = X_test['City'] == city_code
    if city_mask.sum() > 0:
        y_test_city = y_test[city_mask]
        y_pred_city = y_pred[city_mask]
        mse_city = mean_squared_error(y_test_city, y_pred_city)
        r2_city = r2_score(y_test_city, y_pred_city)
        print(f"City: {city}")
        print(f"Test MSE: {mse_city:.2f}")
        print(f"Test R^2 score: {r2_city:.4f}\n")

maize_code = crop_name_to_code.get('Maize')
pune_code = city_name_to_code.get('Pune')
if maize_code is None or pune_code is None:
    raise ValueError("Maize or Pune not found in the dataset. Available crops and cities are: " + str(list(crop_name_to_code.keys())) + " and " + str(list(city_name_to_code.keys())))

most_recent_maize_price = combined_df[(combined_df['Crop'] == maize_code) & (combined_df['City'] == pune_code)]['Price'].iloc[-1]

new_data = pd.DataFrame({
    'Year': [2024],
    'Month': [3],
    'Day': [15],
    'DayOfWeek': [pd.to_datetime('2024-03-15').dayofweek],
    'Crop': [maize_code],
    'City': [pune_code],
    'Season': [get_season(3)],
    'Prev_Price': [most_recent_maize_price]
})
predicted_price = model.predict(new_data)
print("Predicted price for Maize in Pune on 15th March 2024:", predicted_price[0])


joblib.dump(model, 'crop_price_model_xgboost_citywise.pkl')
joblib.dump(crop_name_to_code, 'crop_name_to_code.pkl')
joblib.dump(city_name_to_code, 'city_name_to_code.pkl')
print("Model and mappings saved to 'crop_price_model_xgboost_citywise.pkl', 'crop_name_to_code.pkl', and 'city_name_to_code.pkl'")