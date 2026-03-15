import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
import json
from config.firebase import db
from firebase_admin import auth, firestore
from firebase_admin.exceptions import NotFoundError

hospitals = [
    {
        "name": "City General Hospital",
        "hospitalId": "CGH001",
        "address": "123 Main St",
        "city": "Mumbai",
        "pincode": "400001",
        "phone": "+919876543210",
        "email": "contact@citygeneral.com",
        "type": "Government",
        "departments": "Cardiology, Neurology, General Medicine",
    },
    {
        "name": "Sunrise Apollo Hospital",
        "hospitalId": "SAH002",
        "address": "456 Market Rd",
        "city": "Delhi",
        "pincode": "110001",
        "phone": "+919876543211",
        "email": "info@sunriseapollo.com",
        "type": "Private",
        "departments": "Orthopedics, Pediatrics, Surgery",
    },
    {
        "name": "Fortis Health Care",
        "hospitalId": "FHC003",
        "address": "789 Park Ave",
        "city": "Bangalore",
        "pincode": "560001",
        "phone": "+919876543212",
        "email": "care@fortishealth.com",
        "type": "Private",
        "departments": "Oncology, Dermatology",
    },
    {
        "name": "Max Super Speciality",
        "hospitalId": "MSS004",
        "address": "321 Lake View",
        "city": "Hyderabad",
        "pincode": "500001",
        "phone": "+919876543213",
        "email": "support@maxsuper.com",
        "type": "Private",
        "departments": "Psychiatry, ENT",
    }
]

doctors = [
    # Cardiology (3 doctors) -> CGH001
    {"email": "dr.smith@citygeneral.com", "password": "test123", "fullName": "Dr. John Smith", "phone": "+919876500001", "specialization": "Cardiologist", "medicalRegNumber": "MCI-12345", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "Cardiology"},
    {"email": "dr.doe@citygeneral.com", "password": "test123", "fullName": "Dr. Jane Doe", "phone": "+919876500003", "specialization": "Interventional Cardiologist", "medicalRegNumber": "MCI-12346", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "Cardiology"},
    {"email": "dr.patel@citygeneral.com", "password": "test123", "fullName": "Dr. Rajesh Patel", "phone": "+919876500004", "specialization": "Pediatric Cardiologist", "medicalRegNumber": "MCI-12347", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "Cardiology"},

    # Neurology (2 doctors) -> CGH001
    {"email": "dr.nair@citygeneral.com", "password": "test123", "fullName": "Dr. Suresh Nair", "phone": "+919876500005", "specialization": "Neurologist", "medicalRegNumber": "MCI-12348", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "Neurology"},
    {"email": "dr.sen@citygeneral.com", "password": "test123", "fullName": "Dr. Meera Sen", "phone": "+919876500006", "specialization": "Neurosurgeon", "medicalRegNumber": "MCI-12349", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "Neurology"},

    # General Medicine (3 doctors) -> CGH001
    {"email": "dr.kumar@citygeneral.com", "password": "test123", "fullName": "Dr. Amit Kumar", "phone": "+919876500007", "specialization": "General Physician", "medicalRegNumber": "MCI-12350", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "General Medicine"},
    {"email": "dr.joshi@citygeneral.com", "password": "test123", "fullName": "Dr. Priya Joshi", "phone": "+919876500008", "specialization": "Internal Medicine", "medicalRegNumber": "MCI-12351", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "General Medicine"},
    {"email": "dr.desai@citygeneral.com", "password": "test123", "fullName": "Dr. Krunal Desai", "phone": "+919876500023", "specialization": "General Physician", "medicalRegNumber": "MCI-12352", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "General Medicine"},

    # Orthopedics (2 doctors) -> SAH002
    {"email": "dr.gupta@sunriseapollo.com", "password": "test123", "fullName": "Dr. Anil Gupta", "phone": "+919876500002", "specialization": "Orthopedist", "medicalRegNumber": "MCI-67890", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Orthopedics"},
    {"email": "dr.sharma@sunriseapollo.com", "password": "test123", "fullName": "Dr. Vikram Sharma", "phone": "+919876500009", "specialization": "Spine Surgeon", "medicalRegNumber": "MCI-67891", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Orthopedics"},

    # Pediatrics (3 doctors) -> SAH002
    {"email": "dr.reddy@sunriseapollo.com", "password": "test123", "fullName": "Dr. Kavita Reddy", "phone": "+919876500010", "specialization": "Pediatrician", "medicalRegNumber": "MCI-67892", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Pediatrics"},
    {"email": "dr.khan@sunriseapollo.com", "password": "test123", "fullName": "Dr. Sameer Khan", "phone": "+919876500011", "specialization": "Neonatologist", "medicalRegNumber": "MCI-67893", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Pediatrics"},
    {"email": "dr.singh@sunriseapollo.com", "password": "test123", "fullName": "Dr. Neha Singh", "phone": "+919876500012", "specialization": "Pediatric Oncologist", "medicalRegNumber": "MCI-67894", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Pediatrics"},

    # Surgery (2 doctors) -> SAH002
    {"email": "dr.bose@sunriseapollo.com", "password": "test123", "fullName": "Dr. Ramesh Bose", "phone": "+919876500013", "specialization": "General Surgeon", "medicalRegNumber": "MCI-67895", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Surgery"},
    {"email": "dr.iyer@sunriseapollo.com", "password": "test123", "fullName": "Dr. Lakshmi Iyer", "phone": "+919876500014", "specialization": "Plastic Surgeon", "medicalRegNumber": "MCI-67896", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Surgery"},

    # Oncology (2 doctors) -> FHC003
    {"email": "dr.menon@fortishealth.com", "password": "test123", "fullName": "Dr. Arvind Menon", "phone": "+919876500015", "specialization": "Medical Oncologist", "medicalRegNumber": "MCI-34560", "hospitalName": "Fortis Health Care", "hospitalId": "FHC003", "department": "Oncology"},
    {"email": "dr.das@fortishealth.com", "password": "test123", "fullName": "Dr. Riya Das", "phone": "+919876500016", "specialization": "Radiation Oncologist", "medicalRegNumber": "MCI-34561", "hospitalName": "Fortis Health Care", "hospitalId": "FHC003", "department": "Oncology"},

    # Dermatology (2 doctors) -> FHC003
    {"email": "dr.mehta@fortishealth.com", "password": "test123", "fullName": "Dr. Sanjay Mehta", "phone": "+919876500017", "specialization": "Dermatologist", "medicalRegNumber": "MCI-34562", "hospitalName": "Fortis Health Care", "hospitalId": "FHC003", "department": "Dermatology"},
    {"email": "dr.verma@fortishealth.com", "password": "test123", "fullName": "Dr. Pooja Verma", "phone": "+919876500018", "specialization": "Cosmetologist", "medicalRegNumber": "MCI-34563", "hospitalName": "Fortis Health Care", "hospitalId": "FHC003", "department": "Dermatology"},

    # Psychiatry (2 doctors) -> MSS004
    {"email": "dr.rao@maxsuper.com", "password": "test123", "fullName": "Dr. Vivek Rao", "phone": "+919876500019", "specialization": "Psychiatrist", "medicalRegNumber": "MCI-89010", "hospitalName": "Max Super Speciality", "hospitalId": "MSS004", "department": "Psychiatry"},
    {"email": "dr.shetty@maxsuper.com", "password": "test123", "fullName": "Dr. Ananya Shetty", "phone": "+919876500020", "specialization": "Clinical Psychologist", "medicalRegNumber": "MCI-89011", "hospitalName": "Max Super Speciality", "hospitalId": "MSS004", "department": "Psychiatry"},

    # ENT (3 doctors) -> MSS004
    {"email": "dr.deshmukh@maxsuper.com", "password": "test123", "fullName": "Dr. Rohan Deshmukh", "phone": "+919876500021", "specialization": "Otolaryngologist", "medicalRegNumber": "MCI-89012", "hospitalName": "Max Super Speciality", "hospitalId": "MSS004", "department": "ENT"},
    {"email": "dr.kapoor@maxsuper.com", "password": "test123", "fullName": "Dr. Sunidhi Kapoor", "phone": "+919876500022", "specialization": "ENT Specialist", "medicalRegNumber": "MCI-89013", "hospitalName": "Max Super Speciality", "hospitalId": "MSS004", "department": "ENT"},
    {"email": "dr.ahuja@maxsuper.com", "password": "test123", "fullName": "Dr. Dev Ahuja", "phone": "+919876500024", "specialization": "ENT Surgeon", "medicalRegNumber": "MCI-89014", "hospitalName": "Max Super Speciality", "hospitalId": "MSS004", "department": "ENT"},
    
    # Pending Doctors for Admin Approval
    {"email": "dr.pending1@example.com", "password": "test123", "fullName": "Dr. Pending One", "phone": "+919999900001", "specialization": "Neurology", "medicalRegNumber": "PEND-001", "hospitalName": "City General Hospital", "hospitalId": "CGH001", "department": "Neurology", "status": "pending"},
    {"email": "dr.pending2@example.com", "password": "test123", "fullName": "Dr. Pending Two", "phone": "+919999900002", "specialization": "Orthopedics", "medicalRegNumber": "PEND-002", "hospitalName": "Sunrise Apollo Hospital", "hospitalId": "SAH002", "department": "Orthopedics", "status": "pending"},
    {"email": "dr.pending3@example.com", "password": "test123", "fullName": "Dr. Pending Three", "phone": "+919999900003", "specialization": "Pediatrics", "medicalRegNumber": "PEND-003", "hospitalName": "Max Super Speciality", "hospitalId": "MSS004", "department": "Pediatrics", "status": "pending"},
]

users = [
    {"email": "user1@example.com", "password": "password123", "fullName": "Rahul Sharma", "phone": "+917777700001", "city": "Mumbai", "bloodGroup": "B+", "dob": "1990-01-01"},
    {"email": "user2@example.com", "password": "password123", "fullName": "Sneha Patil", "phone": "+917777700002", "city": "Pune", "bloodGroup": "O-", "dob": "1992-05-15"},
    {"email": "user3@example.com", "password": "password123", "fullName": "Vikram Singh", "phone": "+917777700003", "city": "Delhi", "bloodGroup": "A+", "dob": "1988-11-20"},
    {"email": "user4@example.com", "password": "password123", "fullName": "Anjali Gujral", "phone": "+917777700004", "city": "Jaipur", "bloodGroup": "AB+", "dob": "1995-03-10"},
    {"email": "user5@example.com", "password": "password123", "fullName": "Arjun Reddy", "phone": "+917777700005", "city": "Hyderabad", "bloodGroup": "B-", "dob": "1993-07-25"},
    {"email": "user6@example.com", "password": "password123", "fullName": "Meera Iyer", "phone": "+917777700006", "city": "Chennai", "bloodGroup": "O+", "dob": "1991-09-30"},
    {"email": "user7@example.com", "password": "password123", "fullName": "Karan Malhotra", "phone": "+917777700007", "city": "Chandigarh", "bloodGroup": "A-", "dob": "1987-12-05"},
    {"email": "user8@example.com", "password": "password123", "fullName": "Sanya Mirza", "phone": "+917777700008", "city": "Lucknow", "bloodGroup": "AB-", "dob": "1994-02-18"},
    {"email": "user9@example.com", "password": "password123", "fullName": "Ishaan Khattar", "phone": "+917777700009", "city": "Indore", "bloodGroup": "B+", "dob": "1996-06-22"},
    {"email": "user10@example.com", "password": "password123", "fullName": "Tanya Abrol", "phone": "+917777700010", "city": "Bhopal", "bloodGroup": "O+", "dob": "1992-08-14"},
]

donation_camps = [
    {
        "campId": "CAMP001",
        "name": "Red Cross Mega Donation Drive",
        "city": "Mumbai",
        "venue": "Andheri Sports Complex",
        "address": "Andheri West, Mumbai",
        "date": "2026-03-20",
        "organizer": "Indian Red Cross Society",
        "isActive": True,
        "slots": [
            {"id": "slot-0900", "time": "09:00 AM - 10:00 AM", "capacity": 20, "available": 20},
            {"id": "slot-1030", "time": "10:30 AM - 11:30 AM", "capacity": 20, "available": 20},
            {"id": "slot-1200", "time": "12:00 PM - 01:00 PM", "capacity": 15, "available": 15}
        ]
    },
    {
        "campId": "CAMP002",
        "name": "City Youth Blood Camp",
        "city": "Delhi",
        "venue": "Dwarka Community Hall",
        "address": "Sector 12, Dwarka, Delhi",
        "date": "2026-03-22",
        "organizer": "City Health NGO",
        "isActive": True,
        "slots": [
            {"id": "slot-1000", "time": "10:00 AM - 11:00 AM", "capacity": 25, "available": 25},
            {"id": "slot-1130", "time": "11:30 AM - 12:30 PM", "capacity": 25, "available": 25},
            {"id": "slot-1400", "time": "02:00 PM - 03:00 PM", "capacity": 20, "available": 20}
        ]
    },
    {
        "campId": "CAMP003",
        "name": "Lifesaver Weekend Camp",
        "city": "Bangalore",
        "venue": "Indiranagar Health Center",
        "address": "100 Feet Road, Indiranagar, Bangalore",
        "date": "2026-03-24",
        "organizer": "Lifesaver Foundation",
        "isActive": True,
        "slots": [
            {"id": "slot-0930", "time": "09:30 AM - 10:30 AM", "capacity": 18, "available": 18},
            {"id": "slot-1100", "time": "11:00 AM - 12:00 PM", "capacity": 18, "available": 18},
            {"id": "slot-1330", "time": "01:30 PM - 02:30 PM", "capacity": 18, "available": 18}
        ]
    },
    {
        "campId": "CAMP004",
        "name": "Jabalpur Blood Donation Drive",
        "city": "Jabalpur",
        "venue": "Narmada Hospital Community Hall",
        "address": "Civil Lines, Jabalpur, MP",
        "date": "2026-03-25",
        "organizer": "Jabalpur Blood Bank Society",
        "isActive": True,
        "slots": [
            {"id": "slot-0900", "time": "09:00 AM - 10:00 AM", "capacity": 20, "available": 20},
            {"id": "slot-1100", "time": "11:00 AM - 12:00 PM", "capacity": 20, "available": 20},
            {"id": "slot-1400", "time": "02:00 PM - 03:00 PM", "capacity": 15, "available": 15}
        ]
    },
    {
        "campId": "CAMP005",
        "name": "RaktSetu Community Camp — Jabalpur",
        "city": "Jabalpur",
        "venue": "Medical College Auditorium",
        "address": "Garha, Jabalpur, MP",
        "date": "2026-03-28",
        "organizer": "RaktSetu Foundation",
        "isActive": True,
        "slots": [
            {"id": "slot-1000", "time": "10:00 AM - 11:00 AM", "capacity": 25, "available": 25},
            {"id": "slot-1200", "time": "12:00 PM - 01:00 PM", "capacity": 25, "available": 25},
            {"id": "slot-1500", "time": "03:00 PM - 04:00 PM", "capacity": 20, "available": 20}
        ]
    },
    {
        "campId": "CAMP006",
        "name": "Hyderabad Hope Drive",
        "city": "Hyderabad",
        "venue": "HITEC City Convention Center",
        "address": "Madhapur, Hyderabad",
        "date": "2026-03-26",
        "organizer": "Hyderabad Blood Donors Network",
        "isActive": True,
        "slots": [
            {"id": "slot-0930", "time": "09:30 AM - 10:30 AM", "capacity": 22, "available": 22},
            {"id": "slot-1130", "time": "11:30 AM - 12:30 PM", "capacity": 22, "available": 22},
            {"id": "slot-1400", "time": "02:00 PM - 03:00 PM", "capacity": 18, "available": 18}
        ]
    }
]

# Mock Blood Requests
blood_requests = [
    {
        "requesterId": "USR001",
        "requesterName": "Anil Kumar",
        "phone": "+91 9876543211",
        "email": "anil@example.com",
        "bloodGroup": "O+",
        "units": 2,
        "urgency": "Urgent",
        "hospitalName": "AIIMS Delhi",
        "reason": "Accident emergency, patient needs immediate transfusion",
        "requesterRole": "user",
        "createdAt": datetime.utcnow().isoformat(),
        "status": "active"
    },
    {
        "requesterId": "USR002",
        "requesterName": "Priya Singh",
        "phone": "+91 9876543222",
        "email": "priya@example.com",
        "bloodGroup": "A-",
        "units": 1,
        "urgency": "Normal",
        "hospitalName": "Max Super Speciality",
        "reason": "Scheduled surgery for next week",
        "requesterRole": "user",
        "createdAt": datetime.utcnow().isoformat(),
        "status": "active"
    },
    {
        "requesterId": "HOSP_DOC_001",
        "requesterName": "Dr. Ramesh",
        "phone": "+91 9876500001",
        "email": "bloodbank@apollo.example.com",
        "bloodGroup": "B+",
        "units": 5,
        "urgency": "Urgent",
        "hospitalName": "Apollo Hospital",
        "address": "Jubilee Hills, Hyderabad",
        "reason": "Hospital blood bank running low on B+ inventory",
        "requesterRole": "doctor",
        "createdAt": datetime.utcnow().isoformat(),
        "status": "active"
    },
    {
        "requesterId": "HOSP_DOC_002",
        "requesterName": "Dr. Sarah",
        "phone": "+91 9876500002",
        "email": "emergency@narmada.example.com",
        "bloodGroup": "AB-",
        "units": 3,
        "urgency": "Urgent",
        "hospitalName": "Narmada Hospital",
        "address": "Civil Lines, Jabalpur",
        "reason": "Rare blood group needed for ICU patient",
        "requesterRole": "doctor",
        "createdAt": datetime.utcnow().isoformat(),
        "status": "active"
    }
]

def add_mock_data():
    print("Checking for existing hospitals...")
    # Add hospitals
    for hospital_data in hospitals:
        existing = list(db.collection('hospitals').where('hospitalId', '==', hospital_data['hospitalId']).stream())
        if not existing:
            hospital_data["created_at"] = firestore.SERVER_TIMESTAMP
            db.collection('hospitals').add(hospital_data)
            print(f"Added hospital: {hospital_data['name']}")
        else:
            print(f"Hospital {hospital_data['name']} already exists. Updating...")
            for doc in existing:
                db.collection('hospitals').document(doc.id).update(hospital_data)

    print("\nChecking for existing donation camps...")
    for camp_data in donation_camps:
        existing = list(db.collection('donationCamps').where('campId', '==', camp_data['campId']).stream())
        if not existing:
            payload = {
                **camp_data,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "updatedAt": firestore.SERVER_TIMESTAMP
            }
            db.collection('donationCamps').add(payload)
            print(f"Added donation camp: {camp_data['name']}")
        else:
            print(f"Donation camp {camp_data['name']} already exists. Updating...")
            for doc in existing:
                db.collection('donationCamps').document(doc.id).update({
                    **camp_data,
                    "updatedAt": firestore.SERVER_TIMESTAMP
                })

    print("\nAdding doctors...")
    # Add doctors
    for doc_data in doctors:
        try:
            # Check if user exists in auth
            try:
                # firebase_admin auth get_user_by_email will throw user not found if doesn't exist
                user = auth.get_user_by_email(doc_data['email'])
                print(f"User {doc_data['email']} already exists in Auth. Updating password to {doc_data['password']}...")
                auth.update_user(user.uid, password=doc_data['password'])
            except auth.UserNotFoundError:
                user = auth.create_user(
                    email=doc_data['email'],
                    password=doc_data['password'],
                    display_name=doc_data['fullName'],
                    phone_number=doc_data['phone']
                )
                print(f"Created Auth user for {doc_data['email']}.")
            
            # Create/Update user document in Firestore
            user_data = {
                "name": doc_data['fullName'],
                "fullName": doc_data['fullName'],
                "email": doc_data['email'],
                "phone": doc_data['phone'],
                "role": "doctor",
                "status": "approved", # Set to explicitly approved for mock testing
                "specialization": doc_data['specialization'],
                "registration_number": doc_data['medicalRegNumber'],
                "hospital_name": doc_data['hospitalName'],
                "hospitalName": doc_data['hospitalName'],
                "hospital_id": doc_data['hospitalId'],
                "department": doc_data['department'],
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            # Use specific status if provided (default to approved for most mock doctors)
            if 'status' in doc_data:
                user_data['status'] = doc_data['status']

            db.collection('users').document(user.uid).set(user_data)
            print(f"Set Firestore doctor document for {doc_data['fullName']} (Status: {user_data['status']}).")
            
        except Exception as e:
            print(f"Error adding doctor {doc_data['email']}: {e}")

    print("\nAdding standard users...")
    for user_data in users:
        try:
            try:
                user = auth.get_user_by_email(user_data['email'])
                print(f"User {user_data['email']} already exists. Updating password...")
                auth.update_user(user.uid, password=user_data['password'])
            except auth.UserNotFoundError:
                user = auth.create_user(
                    email=user_data['email'],
                    password=user_data['password'],
                    display_name=user_data['fullName'],
                    phone_number=user_data['phone']
                )
                print(f"Created Auth user for {user_data['email']}.")
            
            # Create Firestore document
            db_user_data = {
                "name": user_data['fullName'],
                "fullName": user_data['fullName'],
                "email": user_data['email'],
                "phone": user_data['phone'],
                "city": user_data['city'],
                "blood_group": user_data['bloodGroup'],
                "bloodGroup": user_data['bloodGroup'],
                "date_of_birth": user_data['dob'],
                "dob": user_data['dob'],
                "role": "user",
                "status": "approved",
                "created_at": firestore.SERVER_TIMESTAMP
            }
            db.collection('users').document(user.uid).set(db_user_data)
        except Exception as e:
            print(f"Error adding user {user_data['email']}: {e}")

    print("\nChecking for existing blood requests...")
    # Delete existing mock requests to re-seed with updated structure
    existing_requests = db.collection('bloodRequests').stream()
    count = 0
    for doc in existing_requests:
        doc.reference.delete()
        count += 1
    print(f"Cleared {count} existing blood requests.")
    
    for req in blood_requests:
        db.collection('bloodRequests').add(req)
    print(f"Added {len(blood_requests)} updated mock blood requests")

if __name__ == '__main__':
    add_mock_data()
