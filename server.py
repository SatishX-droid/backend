from flask import Flask, request, jsonify

app = Flask(__name__)

# Dictionary to store data by activity type
data_store = {}

# Root endpoint to verify server status
@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "Server is running"}), 200

# Endpoint to receive data from iOS tweak
@app.route('/receive_data', methods=['POST'])
def receive_data():
    activity_type = request.form.get('type')
    data_content = request.form.get('data')
    
    # Store the data based on the activity type
    data_store[activity_type] = data_content
    return jsonify({"status": "success", "message": "Data received successfully"})

# Endpoint to fetch data based on activity type
@app.route('/fetch/<activity_type>', methods=['GET'])
def fetch_data(activity_type):
    data = data_store.get(activity_type, "No data available")
    return jsonify({"data": data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
