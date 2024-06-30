import sys
import numpy as np
import pandas as pd

# Get the data file path from the command line arguments
data_path = sys.argv[1] if len(sys.argv) > 1 else '50_Startups.csv'

dataset = pd.read_csv(data_path)
print(dataset)

# Importing the dataset
X = dataset.iloc[:, :-1].values  # Take all rows and all columns except last one
y = dataset.iloc[:, -1].values  # Take all rows and only columns with last column

# Encoding categorical data
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
ct = ColumnTransformer(transformers=[('encoder', OneHotEncoder(), [3])], remainder='passthrough')
X = np.array(ct.fit_transform(X))
print(X)

# Splitting the dataset into the Training set and Test set
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

# Training the Multiple Linear Regression model on the Training set
from sklearn.linear_model import LinearRegression
regressor = LinearRegression()
regressor.fit(X_train, y_train)

# Predicting the Test set results
y_pred = regressor.predict(X_test)
np.set_printoptions(precision=2)

print(np.concatenate((y_pred.reshape(len(y_pred), 1), y_test.reshape(len(y_test), 1)), 1))

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae:.2f}")
print(f"Mean Squared Error: {mse:.2f}")
print(f"Root Mean Squared Error: {rmse:.2f}")
print(f"R-squared: {r2:.2f}")

def predict_profit(new_data):
    """
    Predicts the profit based on new input data.

    Parameters:
    new_data (list): A list containing new R&D Spend, Administration, Marketing Spend, and State.

    Returns:
    float: Predicted profit.
    """
    # Example new_data: [165349.20, 136897.80, 471784.10, 'New York']
    
    # Encode the 'State' field
    state_mapping = {'New York': [1, 0, 0], 'California': [0, 1, 0], 'Florida': [0, 0, 1]}
    state_encoded = state_mapping[new_data[3]]
    
    # Combine the encoded state with other inputs
    processed_data = state_encoded + new_data[:3]
    
    # Convert to numpy array and reshape
    processed_data = np.array(processed_data).reshape(1, -1)
    
    # Predict using the trained model
    predicted_profit = regressor.predict(processed_data)
    
    return predicted_profit[0]

# Example usage
new_data = [165349.20, 136897.80, 471784.10, 'New York']
predicted_profit = predict_profit(new_data)
print(f"Predicted Profit: ${predicted_profit:.2f}")
