# RaktSetu Backend - Modular Architecture

## 🏗️ Architecture Overview

The backend has been restructured into a clean, modular architecture using Flask Blueprints. This design follows best practices for scalability, maintainability, and code organization.

### **Design Principles**
- ✅ **Separation of Concerns**: Each module has a single responsibility
- ✅ **Role-Based Organization**: Routes organized by user roles
- ✅ **Reusability**: Shared utilities and configurations
- ✅ **Scalability**: Easy to add new features and endpoints
- ✅ **Maintainability**: Clean, documented, and organized code

## 📁 Project Structure

```
backend/
├── app_new.py                 # Main application entry point (NEW)
├── app.py                     # Old monolithic app (DEPRECATED)
├── config/                    # Configuration modules
│   ├── __init__.py
│   ├── firebase.py           # Firebase initialization
│   └── settings.py           # Environment configuration
├── routes/                    # Blueprint routes by role
│   ├── __init__.py
│   ├── auth/                 # Authentication routes
│   │   ├── __init__.py
│   │   └── auth_routes.py
│   ├── admin/                # Admin routes
│   │   ├── __init__.py
│   │   └── admin_routes.py
│   ├── doctor/               # Doctor routes
│   │   ├── __init__.py
│   │   └── doctor_routes.py
│   └── user/                 # User/Patient routes
│       ├── __init__.py
│       └── user_routes.py
├── utils/                     # Utility functions
│   ├── __init__.py
│   ├── responses.py          # Response formatters
│   └── validators.py         # Validation functions
├── .env                       # Environment variables
├── requirements.txt           # Python dependencies
└── README_BACKEND.md         # This file
```

## 🎯 Blueprints Overview

### **1. Authentication Blueprint** (`/api/auth`)
Handles user registration and login for all roles.

**Endpoints:**
- `POST /api/auth/register` - Register new user/patient
- `POST /api/auth/doctor-register` - Register new doctor
- `POST /api/auth/admin-register` - Register new admin (requires secret key)
- `POST /api/auth/login` - Login for all roles

### **2. Admin Blueprint** (`/api/admin`)
Handles admin operations: hospital management, doctor approvals, statistics.

**Endpoints:**
- `POST /api/admin/create-hospital` - Create new hospital
- `PUT /api/admin/update-hospital/<id>` - Update hospital
- `GET /api/admin/hospitals` - Get all hospitals
- `DELETE /api/admin/delete-hospital/<id>` - Delete hospital
- `GET /api/admin/doctors` - Get all doctors
- `POST /api/admin/approve-doctor` - Approve doctor registration
- `POST /api/admin/reject-doctor` - Reject doctor registration
- `GET /api/admin/stats` - Get dashboard statistics

### **3. Doctor Blueprint** (`/api/doctor`)
Handles doctor-specific operations (placeholder for future implementation).

**Endpoints:**
- `GET /api/doctor/dashboard` - Get doctor dashboard
- `GET /api/doctor/appointments` - Get doctor's appointments
- `GET /api/doctor/patients` - Get doctor's patients

### **4. User Blueprint** (`/api/user`)
Handles user/patient-specific operations (placeholder for future implementation).

**Endpoints:**
- `GET /api/user/dashboard` - Get user dashboard
- `GET /api/user/appointments` - Get user's appointments
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🔧 Configuration Modules

### **config/firebase.py**
- Initializes Firebase Admin SDK
- Provides Firestore database client
- Centralized Firebase configuration

### **config/settings.py**
- Loads environment variables
- Provides Config class with all settings
- Manages Flask, Firebase, and CORS configuration

## 🛠️ Utility Modules

### **utils/responses.py**
Standardized response formatters:
- `success_response(message, data, status_code)` - Success responses
- `error_response(message, status_code)` - Error responses

### **utils/validators.py**
Common validation functions:
- `validate_phone_number(phone)` - Validate Indian phone numbers
- `validate_email(email)` - Validate email format
- `validate_required_fields(data, fields)` - Check required fields

## 🚀 Running the Application

### **Option 1: Use New Modular App (Recommended)**
```bash
python app_new.py
```

### **Option 2: Use Old Monolithic App (Deprecated)**
```bash
python app.py
```

## 📝 Migration Guide

### **From Old to New**

1. **Backup old app.py**
   ```bash
   cp app.py app_old_backup.py
   ```

2. **Test new structure**
   ```bash
   python app_new.py
   ```

3. **Verify all endpoints work**
   - Test authentication endpoints
   - Test admin endpoints
   - Check frontend integration

4. **Replace old app.py**
   ```bash
   mv app.py app_old.py
   mv app_new.py app.py
   ```

5. **Update deployment scripts** (if any)
   - Ensure they point to `app.py`
   - Update any import statements

## 🎨 Code Style Benefits

### **Before (Monolithic)**
```python
# All routes in one file (400+ lines)
@app.route('/api/auth/register')
@app.route('/api/auth/login')
@app.route('/api/admin/create-hospital')
@app.route('/api/admin/approve-doctor')
# ... 20+ more routes
```

### **After (Modular)**
```python
# Clean separation by role
# auth_routes.py - Authentication only
# admin_routes.py - Admin operations only
# doctor_routes.py - Doctor operations only
# user_routes.py - User operations only
```

## ✨ Key Improvements

1. **Organized by Role**: Each blueprint handles one role's operations
2. **Reusable Utilities**: Common functions in utils/
3. **Centralized Config**: All settings in config/
4. **Standard Responses**: Consistent API responses
5. **Better Validation**: Centralized validation logic
6. **Easy Testing**: Each blueprint can be tested independently
7. **Scalable**: Easy to add new features
8. **Documented**: Clear docstrings and comments

## 🔐 Environment Variables

Required in `.env` file:
```env
FIREBASE_WEB_API_KEY=your_firebase_api_key
ADMIN_SECRET_KEY=your_admin_secret_key
PORT=5000
DEBUG=True
SECRET_KEY=your_flask_secret_key
```

## 📊 Response Format

### **Success Response**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### **Error Response**
```json
{
  "status": "error",
  "message": "Error description"
}
```

## 🧪 Testing

Each blueprint can be tested independently:

```python
# Test auth routes
from routes.auth.auth_routes import auth_bp

# Test admin routes
from routes.admin.admin_routes import admin_bp
```

## 📈 Future Enhancements

- [ ] Add middleware for authentication
- [ ] Implement role-based access control (RBAC)
- [ ] Add request logging
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit tests for each blueprint
- [ ] Implement caching layer
- [ ] Add database migrations

## 🤝 Contributing

When adding new features:

1. **Choose the right blueprint** based on role
2. **Use utility functions** for common operations
3. **Follow naming conventions** (snake_case for functions)
4. **Add docstrings** to all functions
5. **Use standard responses** from utils/responses.py
6. **Validate inputs** using utils/validators.py

## 📞 Support

For issues or questions about the backend architecture, refer to:
- Code comments and docstrings
- This README
- Flask Blueprint documentation

---

**Version**: 2.0.0  
**Architecture**: Modular Blueprint  
**Last Updated**: 2024
