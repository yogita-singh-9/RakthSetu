"""
WebSocket handlers for real-time queue updates
"""
from flask_socketio import emit, join_room, leave_room
from config.socketio import socketio

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    return True

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

@socketio.on('join_queue')
def handle_join_queue(data):
    """Join a specific doctor's queue room"""
    doctor_id = data.get('doctorId')
    if doctor_id:
        join_room(f'queue_{doctor_id}')
        emit('joined_queue', {'doctorId': doctor_id})

@socketio.on('leave_queue')
def handle_leave_queue(data):
    """Leave a doctor's queue room"""
    doctor_id = data.get('doctorId')
    if doctor_id:
        leave_room(f'queue_{doctor_id}')
