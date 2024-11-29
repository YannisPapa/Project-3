from flask import Flask, render_template, jsonify
import pandas as pd

app = Flask(__name__)

df = pd.read_csv(r'data/restaurant_data.csv')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index2.html')
def index2():
    return render_template('index2.html')

@app.route('/category_data', methods=['GET'])
def category_data():
    categories = df['Categories'].str.split(',').explode().str.strip().value_counts()
    return jsonify(categories.to_dict())

@app.route('/categoryTop10_data', methods=['GET'])
def category_top10_data():
    categories = df['Categories'].str.split(',').explode().str.strip().value_counts()
    top10_categories = categories.head(10)
    return jsonify(top10_categories.to_dict())

@app.route('/categoryBottom10_data', methods=['GET'])
def category_bottom10_data():
    categories = df['Categories'].str.split(',').explode().str.strip().value_counts()
    bottom10_categories = categories.tail(10)
    return jsonify(bottom10_categories.to_dict())

@app.route('/rating_data', methods=['GET'])
def rating_data():
    rating_bins = [0, 1, 2, 3, 4, 5]
    rating_labels = ['0-1 ★', '1.1-2 ★', '2.1-3 ★', '3.1-4 ★', '4.1-5 ★']
    
    df['Rating_Category'] = pd.cut(df['Rating'], bins=rating_bins, labels=rating_labels, right=False)
    rating_counts = df['Rating_Category'].value_counts()
    
    return jsonify(rating_counts.to_dict())

@app.route('/price_data', methods=['GET'])
def price_data():
    price_counts = df['Price'].value_counts()
    return jsonify(price_counts.to_dict())

if __name__ == '__main__':
    app.run(debug=True)