from flask import Flask, render_template, redirect, url_for, request, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'salon-secret-key-123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///salon.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='customer') # customer, salon_owner, worker
    bookings = db.relationship('Booking', backref='customer', lazy=True)

class Salon(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    rating = db.Column(db.Float, default=4.5)
    image_url = db.Column(db.String(300))
    logo_url = db.Column(db.String(300))
    map_url = db.Column(db.String(500))
    services = db.relationship('Service', backref='salon', lazy=True)
    workers = db.relationship('Worker', backref='salon', lazy=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Worker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100)) # e.g., Senior Stylist
    phone = db.Column(db.String(20))
    image_url = db.Column(db.String(300))
    is_online = db.Column(db.Boolean, default=False)
    salon_id = db.Column(db.Integer, db.ForeignKey('salon.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    duration = db.Column(db.Integer, default=30) # in minutes
    category = db.Column(db.String(50)) # Hair, Makeup, Nails, etc.
    salon_id = db.Column(db.Integer, db.ForeignKey('salon.id'), nullable=False)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    salon_id = db.Column(db.Integer, db.ForeignKey('salon.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    worker_id = db.Column(db.Integer, db.ForeignKey('worker.id'), nullable=True)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='Pending') # Pending, Confirmed, Accepted, Completed, Cancelled
    
    # Back-references for easy access
    salon = db.relationship('Salon', backref='salon_bookings')
    service = db.relationship('Service', backref='service_bookings')
    worker = db.relationship('Worker', backref='worker_bookings')

class SignupCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    salon_id = db.Column(db.Integer, db.ForeignKey('salon.id'), nullable=False)
    salon = db.relationship('Salon', backref='signup_codes')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/")
def home():
    # Show onboarding welcome screen to guests
    if not current_user.is_authenticated:
        return render_template('welcome.html')

    salons = Salon.query.all()
    categories_raw = db.session.query(Service.category).distinct().all()
    categories_raw = [c[0] for c in categories_raw if c[0]]
    # Custom order to keep Facial and Makeup together
    desired_order = ['Hair', 'Facial', 'Makeup', 'Nails']
    categories = [cat for cat in desired_order if cat in categories_raw]
    # Add any other categories that might exist but aren't in desired_order
    for cat in categories_raw:
        if cat not in categories:
            categories.append(cat)
    
    # Get user's bookings or worker profile
    user_bookings = []
    worker = None
    if current_user.is_authenticated:
        user_bookings = Booking.query.filter_by(user_id=current_user.id).all()
        if current_user.role == 'worker':
            worker = Worker.query.filter_by(user_id=current_user.id).first()

    return render_template("index.html", salons=salons, categories=categories, user_bookings=user_bookings, worker=worker)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        identifier = request.form.get("identifier")
        password = request.form.get("password")
        
        user = User.query.filter_by(email=identifier).first()
        if not user:
            user = User.query.filter_by(phone=identifier).first()
            
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for("home"))
        else:
            flash("Invalid credentials, please try again.")
            
    return render_template("login.html")

# ─── OTP PHONE LOGIN ───────────────────────────────────────────────

@app.route("/send-otp", methods=["POST"])
def send_otp():
    phone = request.form.get("phone", "").strip()
    if len(phone) != 10 or not phone.isdigit():
        flash("Enter a valid 10-digit phone number.")
        return redirect(url_for('home'))

    # Generate 6-digit OTP and store in session
    otp = str(random.randint(100000, 999999))
    session['otp']   = otp
    session['phone'] = phone
    print(f"[SalonGo OTP] Phone: {phone}  OTP: {otp}")  # visible in terminal

    return render_template('otp.html', phone=phone, otp_code=otp)

@app.route("/send-otp/<phone>")
def send_otp_get(phone):
    """Resend OTP via GET (resend link)."""
    otp = str(random.randint(100000, 999999))
    session['otp']   = otp
    session['phone'] = phone
    print(f"[SalonGo OTP] Resent  Phone: {phone}  OTP: {otp}")
    return render_template('otp.html', phone=phone, otp_code=otp)

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    phone       = request.form.get('phone', '').strip()
    entered     = request.form.get('otp', '').strip()
    saved_otp   = session.get('otp', '')
    saved_phone = session.get('phone', '')

    if phone != saved_phone:
        flash("Session mismatch. Please try again.")
        return redirect(url_for('home'))

    if entered != saved_otp:
        flash("Incorrect OTP. Please try again.")
        return render_template('otp.html', phone=phone, otp_code=None)

    # OTP correct — find or create user
    user = User.query.filter_by(phone=phone).first()
    is_new = False
    if not user:
        is_new = True
        user = User(
            name=f"User {phone[-4:]}",
            email=f"{phone}@salongo.app",
            phone=phone,
            password=generate_password_hash(saved_otp),
            role='customer'
        )
        db.session.add(user)
        db.session.commit()

    session.pop('otp', None)
    session.pop('phone', None)
    login_user(user)

    # New users go to profile creation step
    if is_new:
        return redirect(url_for('create_profile'))
    return redirect(url_for('home'))

@app.route("/create-profile", methods=["GET", "POST"])
@login_required
def create_profile():
    if request.method == "POST":
        name  = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()

        if not name or not email:
            flash("Please fill in both fields.")
            return render_template("create_profile.html")

        # Check email not taken by another user
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != current_user.id:
            flash("That email is already in use.")
            return render_template("create_profile.html")

        current_user.name  = name
        current_user.email = email
        db.session.commit()
        return redirect(url_for('home'))

    return render_template("create_profile.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        password = request.form.get("password")
        signup_code = request.form.get("signup_code")
        
        user_exists = User.query.filter_by(email=email).first()
        if user_exists:
            flash("Email already registered.")
            return redirect(url_for("signup"))
            
        role = 'customer'
        salon_id = None

        if signup_code:
            code = SignupCode.query.filter_by(code=signup_code, is_used=False).first()
            if code:
                role = 'worker'
                salon_id = code.salon_id
                code.is_used = True
            else:
                flash("Invalid or used signup code.")
                return redirect(url_for("signup"))

        new_user = User(
            name=name,
            email=email,
            phone=phone,
            password=generate_password_hash(password, method='pbkdf2:sha256'),
            role=role
        )
        db.session.add(new_user)
        db.session.commit()

        if role == 'worker' and salon_id:
            new_worker = Worker(
                name=name,
                role="New Stylist",
                phone=phone,
                image_url="https://i.pravatar.cc/150?u=" + name.replace(" ", ""),
                salon_id=salon_id,
                user_id=new_user.id
            )
            db.session.add(new_worker)
            db.session.commit()
        
        login_user(new_user)
        if role == 'worker':
            return redirect(url_for("home", screen="profile"))
        return redirect(url_for("home"))
        
    return render_template("signup.html")

@app.route("/salon/<int:salon_id>")
def salon_details(salon_id):
    salon = Salon.query.get_or_404(salon_id)
    return render_template("salon_details.html", salon=salon)

@app.route("/booking/new/<int:service_id>")
@login_required
def start_booking(service_id):
    service = Service.query.get_or_404(service_id)
    return render_template("cart.html", service=service)

@app.route("/cart/confirm", methods=["POST"])
@login_required
def confirm_booking():
    service_id = request.form.get("service_id")
    date = request.form.get("date", "Tomorrow")
    time = request.form.get("time", "11:00 AM")
    
    service = Service.query.get_or_404(service_id)
    
    new_booking = Booking(
        user_id=current_user.id,
        salon_id=service.salon_id,
        service_id=service.id,
        date=date,
        time=time
    )
    db.session.add(new_booking)
    db.session.commit()
    return redirect(url_for("confirmation", booking_id=new_booking.id))

@app.route("/confirmation/<int:booking_id>")
@login_required
def confirmation(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    return render_template("confirmation.html", booking=booking)

def seed_data():
    if User.query.filter_by(email="owner@example.com").first():
        return
        
    # Create an Owner
    owner = User(
        name="John Owner",
        email="owner@example.com",
        phone="9876543210",
        password=generate_password_hash("password123"),
        role="salon_owner"
    )
    db.session.add(owner)
    db.session.commit()

    # Salons in Hyderabad
    s1 = Salon(name="GlowUp Unisex Salon", location="Hyderabad, Banjara Hills", rating=4.7, owner_id=owner.id, 
               map_url="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.827222661234!2d78.4482878!3d17.4122998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb973a98555555%3A0x5555555555555555!2sBanjara%20Hills%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin")
    s2 = Salon(name="Urban Style Studio", location="Hyderabad, Jubilee Hills", rating=4.5)
    s3 = Salon(name="Royal Spa & Salon", location="Hyderabad, Gachibowli", rating=4.8)
    s4 = Salon(name="Mirror Mirror Salon", location="Hyderabad, Kukatpally", rating=4.6)
    s5 = Salon(name="The Barber Shop", location="Hyderabad, Madhapur", rating=4.4)
    s6 = Salon(name="Style & Smile", location="Hyderabad, Secunderabad", rating=4.3)
    s7 = Salon(name="Luxury Locks", location="Hyderabad, Kondapur", rating=4.9)
    s8 = Salon(name="Budget Cuts", location="Hyderabad, Ameerpet", rating=4.1)
    
    # Salons in Bengaluru
    s9 = Salon(name="Silicon Cuts", location="Bengaluru, Koramangala", rating=4.7)
    s10 = Salon(name="Garden City Spa", location="Bengaluru, Indiranagar", rating=4.5)
    s11 = Salon(name="Techie Trims", location="Bengaluru, Whitefield", rating=4.4)
    s12 = Salon(name="Velvet Touch", location="Bengaluru, HSR Layout", rating=4.6)
    
    # Salons in Mumbai
    s13 = Salon(name="Bollywood Blush", location="Mumbai, Bandra", rating=4.8)
    s14 = Salon(name="Marine Drive Makeup", location="Mumbai, Colaba", rating=4.7)
    s15 = Salon(name="Gateway Grooming", location="Mumbai, Andheri", rating=4.5)
    s16 = Salon(name="Elite Cuts", location="Mumbai, Juhu", rating=4.9)
    
    # Salons in Delhi
    s17 = Salon(name="Capital Coiffure", location="Delhi, Connaught Place", rating=4.6)
    s18 = Salon(name="Red Fort Refinement", location="Delhi, Saket", rating=4.5)
    s19 = Salon(name="Chandni Chowk Charms", location="Delhi, Hauz Khas", rating=4.4)
    s20 = Salon(name="Lutyens Luxe", location="Delhi, Rohini", rating=4.8)
    
    # Salons in Pune
    s21 = Salon(name="Oxford Styles", location="Pune, Koregaon Park", rating=4.7)
    s22 = Salon(name="Maratha Makeovers", location="Pune, Kothrud", rating=4.6)
    s23 = Salon(name="IT Hub Cuts", location="Pune, Hinjewadi", rating=4.5)
    s24 = Salon(name="Deccan Dazzle", location="Pune, Viman Nagar", rating=4.4)
    
    all_salons = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24]
    db.session.add_all(all_salons)
    db.session.commit()
    
    # Add Workers for all salons
    worker_names = [
        ("Rahul Sharma", "Senior Stylist", "9876500111"),
        ("Priya Singh", "Makeup Artist", "9876500222"),
        ("Amit Patel", "Hair Specialist", ""),
        ("Suresh Kumar", "Master Barber", "9876500444"),
        ("Anjali Devi", "Skin Specialist", "9876500555"),
        ("Vikram Singh", "Massage Therapist", "9876500666")
    ]
    
    # Add Services and Workers for all (Detailed)
    for s in all_salons:
        # Add Workers
        import random
        num_workers = random.randint(3, 5)
        selected_workers = random.sample(worker_names, num_workers)
        for name, role, phone in selected_workers:
            # Generate a random phone if empty
            worker_phone = phone if phone else f"98765{random.randint(10000, 99999)}"
            db.session.add(Worker(
                name=name, 
                role=role, 
                phone=worker_phone, 
                image_url=f"https://i.pravatar.cc/150?u={name.replace(' ', '')}",
                salon_id=s.id
            ))

        # Hair Styles
        db.session.add(Service(name="Classic Fade Cut", price=350, category="Hair", salon_id=s.id))
        db.session.add(Service(name="Crew Cut", price=250, category="Hair", salon_id=s.id))
        db.session.add(Service(name="Bob Cut", price=450, category="Hair", salon_id=s.id))
        db.session.add(Service(name="Long Layers", price=600, category="Hair", salon_id=s.id))
        db.session.add(Service(name="Undercut", price=400, category="Hair", salon_id=s.id))
        
        # Spa Categories
        db.session.add(Service(name="Aromatherapy Massage", price=1800, category="Spa", salon_id=s.id))
        db.session.add(Service(name="Deep Tissue Massage", price=2200, category="Spa", salon_id=s.id))
        db.session.add(Service(name="Swedish Massage", price=1500, category="Spa", salon_id=s.id))
        db.session.add(Service(name="Foot Reflexology", price=600, category="Spa", salon_id=s.id))
        db.session.add(Service(name="Hot Stone Therapy", price=3000, category="Spa", salon_id=s.id))
        db.session.add(Service(name="Head & Shoulder Massage", price=800, category="Spa", salon_id=s.id))
    db.session.commit()

@app.route("/owner/dashboard")
@login_required
def owner_dashboard():
    if current_user.role != 'salon_owner':
        flash("Access denied. Owner role required.")
        return redirect(url_for('home'))
    
    salon = Salon.query.filter_by(owner_id=current_user.id).first()
    if not salon:
        return "You do not own any salons yet. Contact support."
    
    bookings = Booking.query.filter_by(salon_id=salon.id).order_by(Booking.id.desc()).all()
    total_earnings = sum(b.service.price for b in bookings if b.status in ('Accepted', 'Completed'))
    signup_codes = SignupCode.query.filter_by(salon_id=salon.id, is_used=False).all()
    
    return render_template("owner_dashboard.html", salon=salon, bookings=bookings, total_earnings=total_earnings, signup_codes=signup_codes)

@app.route("/owner/generate_code", methods=["POST"])
@login_required
def generate_code():
    if current_user.role != 'salon_owner':
        flash("Access denied. Owner role required.")
        return redirect(url_for('home'))
    
    salon = Salon.query.filter_by(owner_id=current_user.id).first()
    if not salon:
        flash("You do not own any salons yet.")
        return redirect(url_for('owner_dashboard'))

    # Generate a unique 6-character code
    import string
    import random
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not SignupCode.query.filter_by(code=code).first():
            break

    new_code = SignupCode(code=code, salon_id=salon.id)
    db.session.add(new_code)
    db.session.commit()
    
    flash(f"New signup code generated: {code}")
    return redirect(url_for('owner_dashboard'))
    
@app.route("/owner/update_salon", methods=["POST"])
@login_required
def update_salon():
    if current_user.role != 'salon_owner':
        flash("Access denied.")
        return redirect(url_for('home'))
        
    salon = Salon.query.filter_by(owner_id=current_user.id).first()
    if not salon:
        flash("Salon not found.")
        return redirect(url_for('owner_dashboard'))
        
    logo_url = request.form.get("logo_url")
    map_url = request.form.get("map_url")
    
    salon.logo_url = logo_url
    salon.map_url = map_url
    db.session.commit()
    
    flash("Salon details updated successfully!")
    return redirect(url_for('owner_dashboard'))

@app.route("/worker/dashboard")
@login_required
def worker_dashboard():
    if current_user.role != 'worker':
        flash("Worker access required.")
        return redirect(url_for('home'))
    
    worker = Worker.query.filter_by(user_id=current_user.id).first()
    if not worker:
        flash("Worker profile not found.")
        return redirect(url_for('home'))

    bookings = Booking.query.filter_by(salon_id=worker.salon_id).order_by(Booking.id.desc()).all()
    pending_bookings = [b for b in bookings if b.status == 'Pending']
    active_bookings = [b for b in bookings if b.status == 'Accepted' and b.worker_id == worker.id]
    completed_bookings = [b for b in bookings if b.status == 'Completed' and b.worker_id == worker.id]

    return render_template("worker_dashboard.html", 
                           worker=worker, 
                           pending_bookings=pending_bookings,
                           active_bookings=active_bookings,
                           completed_bookings=completed_bookings)

@app.route("/worker/toggle_status")
@login_required
def toggle_worker_status():
    if current_user.role != 'worker':
        return redirect(url_for('home'))
        
    worker = Worker.query.filter_by(user_id=current_user.id).first()
    if worker:
        worker.is_online = not worker.is_online
        db.session.commit()
        flash(f"You are now {'Online' if worker.is_online else 'Offline'}")
    
    return redirect(url_for('home', screen='profile'))

@app.route("/worker/accept_booking/<int:booking_id>")
@login_required
def accept_booking(booking_id):
    if current_user.role != 'worker':
        return redirect(url_for('home'))
        
    worker = Worker.query.filter_by(user_id=current_user.id).first()
    booking = Booking.query.get_or_404(booking_id)
    
    if booking.status == 'Pending':
        booking.status = 'Accepted'
        booking.worker_id = worker.id
        db.session.commit()
        flash("Booking accepted! Start your job.")
    else:
        flash("This booking is no longer available.")
        
    return redirect(url_for('worker_dashboard'))

@app.route("/worker/complete_booking/<int:booking_id>")
@login_required
def complete_booking(booking_id):
    if current_user.role != 'worker':
        return redirect(url_for('home'))
        
    booking = Booking.query.get_or_404(booking_id)
    if booking.worker_id == Worker.query.filter_by(user_id=current_user.id).first().id:
        booking.status = 'Completed'
        db.session.commit()
        flash("Job completed! Well done.")
    
    return redirect(url_for('worker_dashboard'))

@app.route("/worker/update_profile", methods=["POST"])
@login_required
def update_worker_profile():
    if current_user.role != 'worker':
        return redirect(url_for('home'))
        
    worker = Worker.query.filter_by(user_id=current_user.id).first()
    if worker:
        worker.role = request.form.get("specialization")
        worker.phone = request.form.get("phone")
        worker.image_url = request.form.get("image_url")
        db.session.commit()
        flash("Profile updated successfully!")
    
    return redirect(url_for('home', screen="profile"))

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("home"))


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_data()
    app.run(debug=True, host='0.0.0.0', port=5000)


