"""
RaktSetu Backend Application
Main Flask application with modular blueprint architecture
"""
from flask import Flask, jsonify
from flask_cors import CORS

from config.settings import Config
from config.socketio import socketio
from routes.auth.auth_routes import auth_bp
from routes.admin.admin_routes import admin_bp
from routes.doctor.doctor_routes import doctor_bp
from routes.user.user_routes import user_bp

def create_app():
    """
    Application factory pattern
    Creates and configures the Flask application
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Enable CORS
    CORS(app, origins=Config.CORS_ORIGINS)
    
    # Initialize SocketIO
    socketio.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(user_bp)
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """API health check endpoint"""
        return jsonify({
            "status": "success",
            "message": "RaktSetu Backend API is running!",
            "version": "2.0.0",
            "architecture": "Modular Blueprint"
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint with API information"""
        return jsonify({
            "name": "RaktSetu API",
            "version": "2.0.0",
            "description": "Healthcare and Blood Donation Management System",
            "endpoints": {
                "health": "/api/health",
                "auth": "/api/auth/*",
                "admin": "/api/admin/*",
                "doctor": "/api/doctor/*",
                "user": "/api/user/*"
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors"""
        return jsonify({
            "status": "error",
            "message": "Endpoint not found"
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors"""
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500
    
    return app

# Create application instance
app = create_app()

# Import unified socket handlers after app creation
import routes.socket_handlers

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting RaktSetu Backend Server")
    print("=" * 60)
    print(f"📍 Host: 0.0.0.0")
    print(f"🔌 Port: {Config.PORT}")
    print(f"🐛 Debug: {Config.DEBUG}")
    print(f"📦 Architecture: Modular Blueprint")
    print("=" * 60)
    print("\n✅ Available Blueprints:")
    print("   • Authentication (/api/auth)")
    print("   • Admin (/api/admin)")
    print("   • Doctor (/api/doctor)")
    print("   • User (/api/user)")
    print("\n" + "=" * 60)
    
    socketio.run(
        app,
        host='0.0.0.0',
        port=Config.PORT,
        debug=Config.DEBUG
    )
