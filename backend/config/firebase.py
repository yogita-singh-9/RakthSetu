"""
Firebase Configuration Module
Initializes Firebase Admin SDK and provides database client
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialize Firebase Admin SDK
cred = credentials.Certificate("codekumbh-5318d-firebase-adminsdk-fbsvc-4c5adb8c4c.json")
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()
