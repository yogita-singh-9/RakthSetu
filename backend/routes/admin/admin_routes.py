"""
Admin Routes Blueprint
Handles admin operations: hospital management, doctor approvals, statistics
"""
from flask import Blueprint, request
from firebase_admin import firestore

from config.firebase import db
from utils.responses import success_response, error_response
from utils.validators import validate_required_fields

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ==================== MOCK FALLBACK DATA ====================

MOCK_HOSPITALS = [
    {
        "id": "mock-hosp-1",
        "name": "City General Hospital",
        "hospitalId": "CGH001",
        "address": "123 Main St",
        "city": "Mumbai",
        "pincode": "400001",
        "phone": "+91 98765 43210",
        "email": "contact@citygeneral.com",
        "type": "Government",
        "departments": "Cardiology, Neurology, General Medicine"
    },
    {
        "id": "mock-hosp-2",
        "name": "Sunrise Apollo Hospital",
        "hospitalId": "SAH002",
        "address": "456 Market Rd",
        "city": "Delhi",
        "pincode": "110001",
        "phone": "+91 98765 43211",
        "email": "info@sunriseapollo.com",
        "type": "Private",
        "departments": "Orthopedics, Pediatrics, Surgery"
    }
]

MOCK_DOCTORS = [
    {
        "uid": "mock-doc-1",
        "fullName": "Dr. John Smith",
        "email": "dr.smith@citygeneral.com",
        "phone": "+91 98765 00001",
        "role": "doctor",
        "status": "approved",
        "specialization": "Cardiologist",
        "hospitalName": "City General Hospital",
        "department": "Cardiology"
    },
    {
        "uid": "mock-doc-2",
        "fullName": "Dr. Jane Doe",
        "email": "dr.doe@citygeneral.com",
        "phone": "+91 98765 00002",
        "role": "doctor",
        "status": "pending",
        "specialization": "Neurologist",
        "hospitalName": "City General Hospital",
        "department": "Neurology"
    },
    {
        "uid": "mock-doc-3",
        "fullName": "Dr. Anil Gupta",
        "email": "dr.gupta@sunriseapollo.com",
        "phone": "+91 98765 00003",
        "role": "doctor",
        "status": "pending",
        "specialization": "Orthopedist",
        "hospitalName": "Sunrise Apollo Hospital",
        "department": "Orthopedics"
    }
]

# ==================== HOSPITAL MANAGEMENT ====================

@admin_bp.route('/create-hospital', methods=['POST'])
def create_hospital():
    """Create a new hospital"""
    data = request.json
    
    try:
        # Validate required fields
        required_fields = ['name', 'hospitalId', 'address', 'city', 'pincode', 'phone', 'email']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response(error_msg)
        
        hospital_data = {
            "name": data.get('name'),
            "hospitalId": data.get('hospitalId'),
            "address": data.get('address'),
            "city": data.get('city'),
            "pincode": data.get('pincode'),
            "phone": data.get('phone'),
            "email": data.get('email'),
            "type": data.get('type', 'Government'),
            "departments": data.get('departments', ''),
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # Add hospital to Firestore
        doc_ref = db.collection('hospitals').add(hospital_data)
        
        return success_response(
            "Hospital created successfully",
            {"id": doc_ref[1].id},
            201
        )
        
    except Exception as e:
        return error_response(str(e))

@admin_bp.route('/update-hospital/<hospital_id>', methods=['PUT'])
def update_hospital(hospital_id):
    """Update an existing hospital"""
    data = request.json
    
    try:
        # Validate required fields
        required_fields = ['name', 'hospitalId', 'address', 'city', 'pincode', 'phone', 'email']
        is_valid, error_msg = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response(error_msg)
        
        hospital_data = {
            "name": data.get('name'),
            "hospitalId": data.get('hospitalId'),
            "address": data.get('address'),
            "city": data.get('city'),
            "pincode": data.get('pincode'),
            "phone": data.get('phone'),
            "email": data.get('email'),
            "type": data.get('type', 'Government'),
            "departments": data.get('departments', ''),
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        # Update hospital in Firestore
        db.collection('hospitals').document(hospital_id).update(hospital_data)
        
        return success_response("Hospital updated successfully")
        
    except Exception as e:
        return error_response(str(e))

@admin_bp.route('/hospitals', methods=['GET'])
def get_hospitals():
    """Get all hospitals"""
    try:
        hospitals_ref = db.collection('hospitals')
        hospitals = []
        
        for doc in hospitals_ref.stream():
            hospital = doc.to_dict()
            hospital['id'] = doc.id
            hospitals.append(hospital)
        
        if not hospitals:
            hospitals = MOCK_HOSPITALS
        
        return success_response(
            "Hospitals retrieved successfully",
            {"hospitals": hospitals}
        )
        
    except Exception as e:
        return error_response(str(e))

@admin_bp.route('/delete-hospital/<hospital_id>', methods=['DELETE'])
def delete_hospital(hospital_id):
    """Delete a hospital"""
    try:
        db.collection('hospitals').document(hospital_id).delete()
        return success_response("Hospital deleted successfully")
        
    except Exception as e:
        return error_response(str(e))

# ==================== DOCTOR MANAGEMENT ====================

@admin_bp.route('/doctors', methods=['GET'])
def get_doctors():
    """Get all doctors"""
    try:
        users_ref = db.collection('users').where('role', '==', 'doctor')
        doctors = []
        
        for doc in users_ref.stream():
            doctor = doc.to_dict()
            doctor['uid'] = doc.id
            doctors.append(doctor)
        
        if not doctors:
            doctors = MOCK_DOCTORS
        
        return success_response(
            "Doctors retrieved successfully",
            {"doctors": doctors}
        )
        
    except Exception as e:
        return error_response(str(e))

@admin_bp.route('/approve-doctor', methods=['POST'])
def approve_doctor():
    """Approve a doctor registration"""
    data = request.json
    uid = data.get('uid')
    
    if not uid:
        return error_response("Doctor UID is required")
    
    try:
        # Update doctor status to approved
        db.collection('users').document(uid).update({
            "status": "approved",
            "approved_at": firestore.SERVER_TIMESTAMP
        })
        
        return success_response("Doctor approved successfully")
        
    except Exception as e:
        return error_response(str(e))

@admin_bp.route('/reject-doctor', methods=['POST'])
def reject_doctor():
    """Reject a doctor registration"""
    data = request.json
    uid = data.get('uid')
    
    if not uid:
        return error_response("Doctor UID is required")
    
    try:
        # Update doctor status to rejected
        db.collection('users').document(uid).update({
            "status": "rejected",
            "rejected_at": firestore.SERVER_TIMESTAMP
        })
        
        return success_response("Doctor rejected successfully")
        
    except Exception as e:
        return error_response(str(e))

# ==================== STATISTICS ====================

@admin_bp.route('/stats', methods=['GET'])
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        # Count hospitals
        hospitals_count = len(list(db.collection('hospitals').stream()))
        
        # Count doctors by status
        all_users = list(db.collection('users').stream())
        pending_doctors = sum(
            1 for doc in all_users 
            if doc.to_dict().get('role') == 'doctor' 
            and doc.to_dict().get('status') == 'pending'
        )
        approved_doctors = sum(
            1 for doc in all_users 
            if doc.to_dict().get('role') == 'doctor' 
            and doc.to_dict().get('status') == 'approved'
        )
        total_users = sum(
            1 for doc in all_users 
            if doc.to_dict().get('role') == 'user'
        )
        
        if hospitals_count == 0 and pending_doctors == 0 and approved_doctors == 0:
            # Return hardcoded fallback if absolutely zero data
            return success_response(
                "Statistics retrieved successfully (Mock Fallback)",
                {
                    "totalHospitals": len(MOCK_HOSPITALS),
                    "pendingDoctors": sum(1 for d in MOCK_DOCTORS if d['status'] == 'pending'),
                    "approvedDoctors": sum(1 for d in MOCK_DOCTORS if d['status'] == 'approved'),
                    "totalUsers": 15
                }
            )

        return success_response(
            "Statistics retrieved successfully",
            {
                "totalHospitals": hospitals_count,
                "pendingDoctors": pending_doctors,
                "approvedDoctors": approved_doctors,
                "totalUsers": total_users
            }
        )
        
    except Exception as e:
        return error_response(str(e))

@admin_bp.route('/migrate-doctor-fields', methods=['POST'])
def migrate_doctor_fields():
    """Migrate old doctor field names to new camelCase convention"""
    try:
        users_ref = db.collection('users').where('role', '==', 'doctor')
        updated_count = 0
        
        for doc in users_ref.stream():
            doctor = doc.to_dict()
            updates = {}
            
            # Migrate hospital_name to hospitalName
            if 'hospital_name' in doctor and 'hospitalName' not in doctor:
                updates['hospitalName'] = doctor['hospital_name']
            
            # Add fullName if missing
            if 'fullName' not in doctor and 'name' in doctor:
                updates['fullName'] = doctor['name']
            
            # Apply updates if any
            if updates:
                db.collection('users').document(doc.id).update(updates)
                updated_count += 1
        
        return success_response(
            f"Migration completed. Updated {updated_count} doctor records.",
            {"updated_count": updated_count}
        )
        
    except Exception as e:
        return error_response(str(e))
