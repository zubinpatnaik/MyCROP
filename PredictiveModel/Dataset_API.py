import pandas as pd
import os

# Define the base directory where the city folders are located
base_dir = 'dataset'  # Update this to the path where your city folders are stored

# List of cities (based on folder names)
cities = ['Thane', 'Mumbai', 'Nagpur', 'Nashik', 'Pune', 'Raigad']

# Dictionary to map filenames to crop names (adjust if filenames differ)
crop_mapping = {
    'Maize_2016-2025.xlsx': 'Maize',
    'Rice_2016-2025.xlsx': 'Rice',
    'Jowar(Sorghum)_2016-2025.xlsx': 'Jowar',
    'Bengal+Gram(Gram)(Whole)_2016-2025.xlsx': 'Bengal Gram',
    'Wheat_2016-2025.xlsx': 'Wheat'
}

# Empty list to store dataframes
dataframes = []

# Load data from each city folder
for city in cities:
    city_dir = os.path.join(base_dir, city)
    if not os.path.exists(city_dir):
        print(f"Warning: Directory for {city} not found at {city_dir}")
        continue

    # Load each crop file in the city folder
    for filename in os.listdir(city_dir):
        if filename in crop_mapping:
            crop_name = crop_mapping[filename]
            file_path = os.path.join(city_dir, filename)

            # Load the Excel file
            try:
                df = pd.read_excel(file_path)
            except Exception as e:
                print(f"Error loading {file_path}: {str(e)}")
                continue

            # Add Crop and City columns
            df['Crop'] = crop_name
            df['City'] = city

            # Parse the Date column (format: "19 Jan 2019")
            try:
                df['Date'] = pd.to_datetime(df['Date'], format='%d %b %Y')
            except Exception as e:
                print(f"Error parsing Date in {file_path}: {str(e)}")
                continue

            # Add the dataframe to the list
            dataframes.append(df)
        else:
            print(f"Warning: Unrecognized file {filename} in {city_dir}")

# Combine all dataframes into one
if not dataframes:
    print("Error: No dataframes were loaded. Check your files and paths.")
    exit(1)

combined_df = pd.concat(dataframes, ignore_index=True)

# Check for duplicates (same date, crop, and city with different prices)
duplicates = combined_df[combined_df.duplicated(subset=['Date', 'Crop', 'City'], keep=False)]
if not duplicates.empty:
    print("Duplicates found:\n", duplicates)
    # Average the prices for duplicate entries
    combined_df = combined_df.groupby(['Date', 'Crop', 'City'], as_index=False).agg({'Price': 'mean'})

# Check the combined dataframe
print("Combined dataframe with City column:\n", combined_df.head())

# Save the combined dataset to an Excel file
combined_df.to_excel('combined_crop_data_citywise.xlsx', index=False)
print("Combined dataset saved to 'combined_crop_data_citywise.xlsx'")