"""
Validation Utilities
Common validation functions for request data
"""

def validate_phone_number(phone):
    """
    Validate Indian phone number format
    
    Args:
        phone (str): Phone number to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not phone:
        return False, "Phone number is required"
    
    if not phone.startswith('+91'):
        return False, "Phone number must start with +91"
    
    if len(phone) != 13:
        return False, "Invalid Indian phone number format. Expected +91 followed by 10 digits."
    
    return True, None

def validate_email(email):
    """
    Basic email validation
    
    Args:
        email (str): Email to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not email:
        return False, "Email is required"
    
    if '@' not in email or '.' not in email:
        return False, "Invalid email format"
    
    return True, None

def validate_required_fields(data, required_fields):
    """
    Validate that all required fields are present
    
    Args:
        data (dict): Data to validate
        required_fields (list): List of required field names
    
    Returns:
        tuple: (is_valid, error_message)
    """
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, None
