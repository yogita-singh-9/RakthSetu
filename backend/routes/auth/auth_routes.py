"""
Authentication Routes Blueprint
Handles user registration and login for all roles
"""
from flask import Blueprint, request
from firebase_admin import auth, firestore
import requests

from config.firebase import db
from config.settings import Config
from utils.responses import success_response, error_response
from utils.validators import validate_phone_number, validate_email, validate_required_fields

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (patient)"""
    data = request.json
    
    try:
        # Validate required fields
        required_fields = ['email', 'password', 'fullName', 'phone']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response(error_msg)
        
        # Validate phone number
        is_valid, error_msg = validate_phone_number(data.get('phone'))
        if not is_valid:
            return error_response(error_msg)
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=data.get('email'),
            password=data.get('password'),
            display_name=data.get('fullName'),
            phone_number=data.get('phone')
        )
        
        # Determine role and status
        role = data.get('role', 'user')
        status = 'pending' if role == 'doctor' else 'approved'
        
        # Create user document in Firestore
        user_data = {
            "name": data.get('fullName'),
            "fullName": data.get('fullName'),
            "email": data.get('email'),
            "phone": data.get('phone'),
            "role": role,
            "status": status,
            "city": data.get('city'),
            "pincode": data.get('pincode'),
            "blood_group": data.get('bloodGroup'),
            "date_of_birth": data.get('dob'),
            "aadhaarNumber": data.get('aadhaarNumber'),
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # Add doctor specific fields if role is doctor
        if role == 'doctor':
            user_data.update({
                "specialization": data.get('specialization'),
                "registration_number": data.get('medicalRegNumber'),
                "hospital_name": data.get('hospitalName'),
                "hospital_id": data.get('hospitalId'),
                "department": data.get('department')
            })
        
        db.collection('users').document(user.uid).set(user_data)
        
        return success_response(
            f"{role.capitalize()} registered successfully",
            {
                "uid": user.uid,
                "role": role,
                "account_status": status
            },
            201
        )
        
    except Exception as e:
        error_msg = str(e)
        if "CONFIGURATION_NOT_FOUND" in error_msg:
            error_msg = "Auth provider not enabled. Please enable 'Email/Password' in your Firebase Console."
        return error_response(error_msg)

@auth_bp.route('/doctor-register', methods=['POST'])
def doctor_register():
    """Register a new doctor (sets role to doctor)"""
    data = request.json
    data['role'] = 'doctor'
    return register()

@auth_bp.route('/admin-register', methods=['POST'])
def admin_register():
    """Register a new admin (requires secret key)"""
    data = request.json
    
    try:
        # Validate required fields
        required_fields = ['email', 'password', 'username', 'secretKey']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response(error_msg)
        
        # Validate secret key
        if data.get('secretKey') != Config.ADMIN_SECRET_KEY:
            return error_response("Invalid secret key", 403)
        
        # Create admin user in Firebase Auth
        user = auth.create_user(
            email=data.get('email'),
            password=data.get('password'),
            display_name=data.get('username')
        )
        
        # Create admin document in Firestore
        admin_data = {
            "username": data.get('username'),
            "email": data.get('email'),
            "role": "admin",
            "status": "approved",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        db.collection('users').document(user.uid).set(admin_data)
        
        return success_response(
            "Admin registered successfully",
            {
                "uid": user.uid,
                "role": "admin"
            },
            201
        )
        
    except Exception as e:
        return error_response(str(e))

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with email and password"""
    data = request.json
    
    # Validate required fields
    required_fields = ['email', 'password']
    is_valid, error_msg = validate_required_fields(data, required_fields)
    if not is_valid:
        return error_response(error_msg)
    
    if not Config.FIREBASE_WEB_API_KEY:
        return error_response(
            "Missing FIREBASE_WEB_API_KEY. Please configure in environment variables.",
            500
        )
    
    try:
        # Call Firebase Auth REST API to verify password
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={Config.FIREBASE_WEB_API_KEY}"
        payload = {
            "email": data.get('email'),
            "password": data.get('password'),
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        if "error" in response_data:
            return error_response(response_data["error"]["message"], 401)
        
        uid = response_data["localId"]
        
        # Fetch user role/data from Firestore
        user_doc = db.collection('users').document(uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        return success_response(
            "Login successful",
            {
                "uid": uid,
                "idToken": response_data["idToken"],
                "user": user_data
            }
        )
        
    except Exception as e:
        return error_response(str(e))
