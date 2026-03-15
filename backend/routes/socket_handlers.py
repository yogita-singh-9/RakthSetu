"""
Unified Socket.IO Event Handlers
Handles real-time communication between users and doctors.

Rooms:
  - user_{userId}   : personal room for targeted notifications
  - queue_{doctorId} : room for everyone watching a doctor's queue
"""
from flask_socketio import emit, join_room, leave_room
from config.socketio import socketio

# Track connected users for debugging
connected_users = {}


@socketio.on('connect')
def handle_connect():
    """Handle new client socket connection"""
    print('[Socket] Client connected')
    return True


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client socket disconnection"""
    from flask import request
    sid = request.sid
    user_info = connected_users.pop(sid, None)
    if user_info:
        print(f'[Socket] Disconnected: {user_info.get("role")} — {user_info.get("userId")}')
    else:
        print('[Socket] Client disconnected')


@socketio.on('register')
def handle_register(data):
    """
    Register a connected client with their identity.
    Joins them into personal and role rooms.

    Expected payload: { userId: string, role: 'user' | 'doctor' }
    """
    from flask import request
    user_id = data.get('userId')
    role = data.get('role')

    if not user_id or not role:
        emit('error', {'message': 'userId and role are required for registration'})
        return

    # Track the connection
    connected_users[request.sid] = {'userId': user_id, 'role': role}

    # Join personal room so we can send targeted events
    join_room(f'user_{user_id}')

    # Join role-based room (useful for broadcasting to all doctors, etc.)
    join_room(f'role_{role}')

    print(f'[Socket] Registered: {role} — {user_id}')
    emit('registered', {'userId': user_id, 'role': role})


@socketio.on('join_queue')
def handle_join_queue(data):
    """
    Join a specific doctor's queue room for real-time queue updates.

    Expected payload: { doctorId: string }
    """
    doctor_id = data.get('doctorId')
    if doctor_id:
        join_room(f'queue_{doctor_id}')
        emit('joined_queue', {'doctorId': doctor_id})
        print(f'[Socket] Client joined queue_{doctor_id}')


@socketio.on('leave_queue')
def handle_leave_queue(data):
    """
    Leave a doctor's queue room.

    Expected payload: { doctorId: string }
    """
    doctor_id = data.get('doctorId')
    if doctor_id:
        leave_room(f'queue_{doctor_id}')
        print(f'[Socket] Client left queue_{doctor_id}')
