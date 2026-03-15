import requests
import json
import uuid

BASE_URL = "http://localhost:5000/api/auth"

def test_role_flow(role, email=None):
    print(f"\n--- Testing {role.capitalize()} Flow ---")
    u_id = str(uuid.uuid4())[:8]
    if not email:
        email = f"verify_{role}_{u_id}@test.com"
    
    password = "password123"
    
    reg_data = {
        "fullName": f"Verify {role.capitalize()}",
        "email": email,
        "password": password,
        "phone": f"+91{uuid.uuid4().int % 10**10:010d}"
    }
    
    if role == 'user':
        reg_data.update({
            "aadhaarNumber": "111122223333",
            "city": "Verification City",
            "bloodGroup": "O+",
            "dob": "1995-05-05"
        })
        endpoint = f"{BASE_URL}/register"
    elif role == 'doctor':
        reg_data.update({
            "aadhaarNumber": "222233334444",
            "specialization": "General",
            "medicalRegNumber": f"REG-{u_id}",
            "hospitalName": "City Hospital",
            "hospitalId": "HOSP-001",
            "department": "Cardiology"
        })
        endpoint = f"{BASE_URL}/doctor-register"
    elif role == 'admin':
        reg_data = {
            "username": f"admin_{u_id}",
            "email": email,
            "password": password,
            "secretKey": "raktsetu_admin_2024"
        }
        endpoint = f"{BASE_URL}/admin-register"

    # Registration
    print(f"Registering {role}...")
    r = requests.post(endpoint, json=reg_data)
    print(f"Reg Status: {r.status_code}")
    if r.status_code != 201:
        print(f"Reg Error: {r.text}")
    
    # Login
    print(f"Logging in {role}...")
    login_data = {"email": email, "password": password}
    r = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"Login Success! Role in DB: {data.get('user', {}).get('role')}")
        return True
    else:
        print(f"Login Failed: {r.text}")
        return False

if __name__ == "__main__":
    success = True
    success &= test_role_flow('user')
    success &= test_role_flow('doctor')
    success &= test_role_flow('admin')
    
    if success:
        print("\n✅ ALL ROLE AUTH FLOWS VERIFIED SUCCESSFULLY!")
    else:
        print("\n❌ SOME AUTH FLOWS FAILED!")
