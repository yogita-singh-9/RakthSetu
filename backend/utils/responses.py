"""
Response Utilities
Standard response formatters for API endpoints
"""
from flask import jsonify

def success_response(message, data=None, status_code=200):
    """
    Create a standardized success response
    
    Args:
        message (str): Success message
        data (dict): Optional data to include
        status_code (int): HTTP status code
    
    Returns:
        tuple: (response, status_code)
    """
    response = {
        "status": "success",
        "message": message
    }
    if data:
        response.update(data)
    return jsonify(response), status_code

def error_response(message, status_code=400):
    """
    Create a standardized error response
    
    Args:
        message (str): Error message
        status_code (int): HTTP status code
    
    Returns:
        tuple: (response, status_code)
    """
    return jsonify({
        "status": "error",
        "message": message
    }), status_code
