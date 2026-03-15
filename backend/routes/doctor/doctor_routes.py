"""
Doctor Routes Blueprint
Handles doctor-specific operations including queue management
"""
from flask import Blueprint, request
from datetime import datetime
from config.firebase import db
from utils.responses import success_response, error_response
from config.socketio import socketio
from flask_socketio import emit

doctor_bp = Blueprint('doctor', __name__, url_prefix='/api/doctor')

def _normalize_appointment(apt, user_data, patient_id):
    """Fill missing appointment fields with doctor panel-safe defaults."""
    now_date = datetime.now().strftime('%Y-%m-%d')
    fallback_time = apt.get('time') or apt.get('appointmentTime') or '10:00 AM'
    return {
        'id': apt.get('id') or f"mock-{patient_id}-{now_date}-{fallback_time.replace(':', '').replace(' ', '')}",
        'patientName': apt.get('patientName') or user_data.get('name') or user_data.get('fullName') or 'Patient Name',
        'patientPhone': apt.get('patientPhone') or user_data.get('phone') or '+91 90000 00000',
        'patientId': apt.get('patientId') or patient_id,
        'hospitalName': apt.get('hospitalName') or 'City General Hospital',
        'ward': apt.get('ward') or 'General OPD',
        'doctorName': apt.get('doctorName') or 'Assigned Doctor',
        'doctorId': apt.get('doctorId'),
        'date': apt.get('date') or now_date,
        'time': fallback_time,
        'appointmentTime': fallback_time,
        'reason': apt.get('reason') or 'General Consultation',
        'priority': apt.get('priority') or 'Normal',
        'status': apt.get('status') or 'Upcoming'
    }

def _mock_doctor_appointments(doctor_name):
    """Hardcoded fallback appointments for doctor panel when data is empty."""
    today = datetime.now().strftime('%Y-%m-%d')
    doctor_label = doctor_name or 'Assigned Doctor'
    return [
        {
            'id': f"mock-1-{today}",
            'patientName': 'Rohit Sharma',
            'patientPhone': '+91 98765 43210',
            'patientId': 'mock-user-1',
            'hospitalName': 'City General Hospital',
            'ward': 'General OPD',
            'doctorName': doctor_label,
            'date': today,
            'time': '10:00 AM',
            'appointmentTime': '10:00 AM',
            'reason': 'Fever and weakness',
            'priority': 'Normal',
            'status': 'Upcoming'
        },
        {
            'id': f"mock-2-{today}",
            'patientName': 'Ananya Patel',
            'patientPhone': '+91 91234 56789',
            'patientId': 'mock-user-2',
            'hospitalName': 'City General Hospital',
            'ward': 'General OPD',
            'doctorName': doctor_label,
            'date': today,
            'time': '11:00 AM',
            'appointmentTime': '11:00 AM',
            'reason': 'Follow-up consultation',
            'priority': 'Urgent',
            'status': 'Upcoming'
        },
        {
            'id': f"mock-3-{today}",
            'patientName': 'Neha Gupta',
            'patientPhone': '+91 99887 76655',
            'patientId': 'mock-user-3',
            'hospitalName': 'City General Hospital',
            'ward': 'General OPD',
            'doctorName': doctor_label,
            'date': today,
            'time': '12:00 PM',
            'appointmentTime': '12:00 PM',
            'reason': 'Routine checkup',
            'priority': 'Normal',
            'status': 'Upcoming'
        }
    ]

@doctor_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get doctor dashboard data (Mock stats)"""
    return success_response(
        "Doctor dashboard statistics retrieved",
        {
            "totalAppointments": 42,
            "pendingAppointments": 8,
            "completedAppointments": 34,
            "patientCount": 15,
            "emergencyRequests": 3
        }
    )

@doctor_bp.route('/appointments/today', methods=['GET'])
def get_today_appointments():
    """Get today's appointments for doctor"""
    try:
        doctor_id = request.args.get('doctorId')
        if not doctor_id:
            return error_response("Doctor ID required", 400)
        
        # Get doctor info to find their name
        doctor_doc = db.collection('users').document(doctor_id).get()
        if not doctor_doc.exists:
            return error_response("Doctor not found", 404)
        
        doctor_data = doctor_doc.to_dict()
        doctor_name = doctor_data.get('name') or doctor_data.get('fullName')
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Get all users and filter appointments
        users_ref = db.collection('users').where('role', '==', 'user')
        today_appointments = []
        
        for user_doc in users_ref.stream():
            user_data = user_doc.to_dict()
            user_appointments = user_data.get('appointments', [])
            
            for apt in user_appointments:
                if apt.get('doctorName') == doctor_name and apt.get('date') == today:
                    today_appointments.append(_normalize_appointment(apt, user_data, user_doc.id))

        if not today_appointments:
            today_appointments = _mock_doctor_appointments(doctor_name)
        
        # Sort by time
        today_appointments.sort(key=lambda x: x.get('time', ''))
        
        return success_response("Today's appointments retrieved", {'appointments': today_appointments})
    except Exception as e:
        return error_response(f"Error fetching today's appointments: {str(e)}", 500)

@doctor_bp.route('/queue/update', methods=['POST'])
def update_queue_status():
    """Update appointment status and notify users"""
    try:
        data = request.json
        appointment_id = data.get('appointmentId')
        patient_id = data.get('patientId')
        doctor_id = data.get('doctorId')
        status = data.get('status')  # 'completed', 'in-progress', 'waiting'
        user_id = data.get('userId') or data.get('patientId')
        
        if not appointment_id or not patient_id or not doctor_id or not status:
            return error_response("Appointment ID, patient ID, doctor ID and status required", 400)
        
        # Update nested appointment status
        user_ref = db.collection('users').document(patient_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return error_response("Patient not found", 404)
            
        user_data = user_doc.to_dict()
        appointments = user_data.get('appointments', [])
        
        appointment_found = False
        target_appointment = None
        for apt in appointments:
            if apt.get('id') == appointment_id:
                apt['status'] = status
                apt['updatedAt'] = datetime.now().isoformat()
                appointment_found = True
                target_appointment = apt
                break
                
        if not appointment_found:
            return error_response("Appointment not found", 404)
            
        user_ref.update({'appointments': appointments})
        
        # Emit real-time update to specific doctor's queue room
        socketio.emit('queue_updated', {
            'appointmentId': appointment_id,
            'status': status,
            'userId': patient_id,
            'doctorId': doctor_id,
            'appointment': target_appointment
        }, room=f'queue_{doctor_id}')
        
        # Also notify the individual patient so their dashboard updates in real-time
        socketio.emit('notification', {
            'type': 'appointment_update',
            'appointmentId': appointment_id,
            'status': status,
            'doctorId': doctor_id,
            'message': f'Your appointment status has been updated to: {status}'
        }, room=f'user_{patient_id}')
        
        return success_response("Queue updated successfully", {'appointment': target_appointment})
    except Exception as e:
        return error_response(str(e), 500)

@doctor_bp.route('/appointments/status', methods=['PUT'])
def update_appointment_status():
    """Update user appointment status and handle blood donation checkups"""
    try:
        data = request.json
        patient_id = data.get('patientId')
        appointment_id = data.get('appointmentId')
        status = data.get('status')
        reason = data.get('reason')
        
        if not patient_id or not appointment_id or not status:
            return error_response("Patient ID, Appointment ID, and status required", 400)
            
        user_ref = db.collection('users').document(patient_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return error_response("Patient not found", 404)
            
        user_data = user_doc.to_dict()
        appointments = user_data.get('appointments', [])
        
        appointment_found = False
        for apt in appointments:
            if apt.get('id') == appointment_id:
                apt['status'] = status
                apt['updatedAt'] = datetime.now().isoformat()
                appointment_found = True
                break
                
        if not appointment_found:
            return error_response("Appointment not found", 404)
            
        update_data = {'appointments': appointments}
        
        # Handle Blood Donation Checkup / Camp approval logic
        if reason in ('Blood Donation Checkup', 'Blood Donation Camp'):
            if status == 'Passed':
                update_data['isBloodDonor'] = True
                # Set the appointment date as the last donation date
                for apt in appointments:
                    if apt.get('id') == appointment_id:
                        update_data['lastDonationDate'] = apt.get('date', datetime.now().strftime('%Y-%m-%d'))
                        break
            
        # Add doctor note if provided
        if data.get('doctorNote'):
            for apt in appointments:
                if apt.get('id') == appointment_id:
                    apt['doctorNote'] = data.get('doctorNote')
                    
        user_ref.update(update_data)
        
        return success_response("Appointment status updated successfully", {"status": status})
    except Exception as e:
        return error_response(f"Error updating appointment status: {str(e)}", 500)

@doctor_bp.route('/patients', methods=['GET'])
def get_patients():
    """Get doctor's patients (Mock list)"""
    return success_response(
        "Doctor patients retrieved",
        {
            "patients": [
                {"id": "mock-p-1", "name": "Rohit Sharma", "age": 32, "bloodGroup": "O+", "lastVisit": "2024-03-10"},
                {"id": "mock-p-2", "name": "Ananya Patel", "age": 28, "bloodGroup": "B-", "lastVisit": "2024-03-12"},
                {"id": "mock-p-3", "name": "Neha Gupta", "age": 45, "bloodGroup": "AB+", "lastVisit": "2024-03-05"},
                {"id": "mock-p-4", "name": "Amit Kumar", "age": 52, "bloodGroup": "A+", "lastVisit": "2024-03-08"}
            ]
        }
    )

@doctor_bp.route('/appointments', methods=['GET'])
def get_appointments():
    """Get all appointments for a doctor"""
    try:
        doctor_id = request.args.get('doctorId')
        doctor_name = request.args.get('doctorName')
        
        if not doctor_id and not doctor_name:
            return error_response("Doctor ID or name required", 400)
        
        # Get all users and filter appointments
        users_ref = db.collection('users').where('role', '==', 'user')
        all_appointments = []
        
        for user_doc in users_ref.stream():
            user_data = user_doc.to_dict()
            user_appointments = user_data.get('appointments', [])
            
            for apt in user_appointments:
                # Filter by doctor name
                if doctor_name and apt.get('doctorName') == doctor_name:
                    all_appointments.append(_normalize_appointment(apt, user_data, user_doc.id))

        if not all_appointments:
            all_appointments = _mock_doctor_appointments(doctor_name)
        
        # Sort by date and time
        all_appointments.sort(key=lambda x: (x.get('date', ''), x.get('time', '')), reverse=True)
        
        return success_response(
            "Appointments retrieved successfully",
            {"appointments": all_appointments, "total": len(all_appointments)}
        )
    except Exception as e:
        return error_response(f"Error fetching appointments: {str(e)}", 500)

@doctor_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update doctor profile"""
    try:
        data = request.json
        doctor_id = data.get('uid') or data.get('doctorId')
        
        if not doctor_id:
            return error_response("Doctor ID (uid) is required", 400)
        
        # Prepare update data
        update_data = {}
        
        if data.get('fullName'):
            update_data['name'] = data.get('fullName')
            update_data['fullName'] = data.get('fullName')
        if data.get('email'):
            update_data['email'] = data.get('email')
        if data.get('phone'):
            update_data['phone'] = data.get('phone')
        if data.get('specialization'):
            update_data['specialization'] = data.get('specialization')
        if data.get('medicalRegNumber'):
            update_data['registration_number'] = data.get('medicalRegNumber')
        if data.get('hospitalName'):
            update_data['hospital_name'] = data.get('hospitalName')
        if data.get('hospitalId'):
            update_data['hospital_id'] = data.get('hospitalId')
        if data.get('department'):
            update_data['department'] = data.get('department')
        if data.get('aadhaarNumber'):
            update_data['aadhaarNumber'] = data.get('aadhaarNumber')
        
        if not update_data:
            return error_response("No data to update", 400)
        
        # Update in Firestore
        db.collection('users').document(doctor_id).update(update_data)
        
        return success_response("Profile updated successfully", {"user": update_data})
    except Exception as e:
        return error_response(f"Error updating profile: {str(e)}", 500)
