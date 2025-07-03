from flask import Blueprint, render_template, request, jsonify
import sys
import os

# Add the NOVA folder to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'nova')))
from main import answer_query

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/ask', methods=['POST'])
def ask():
    user_query = request.get_json().get('query', '')
    response = answer_query(user_query)
    return jsonify({'response': response})
