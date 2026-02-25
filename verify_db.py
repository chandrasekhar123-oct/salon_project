from app import app, db, Salon, Worker, Service, User
from werkzeug.security import generate_password_hash
import random

with app.app_context():
    # Clear all data
    db.drop_all()
    db.create_all()
    print("Database cleared and tables recreated.")
    
    # Create Owner
    owner = User(
        name="John Owner",
        email="owner@example.com",
        phone="9876543210",
        password=generate_password_hash("password123"),
        role="salon_owner"
    )
    db.session.add(owner)
    db.session.commit()

    # Salons
    s1 = Salon(name="GlowUp Unisex Salon", location="Hyderabad, Banjara Hills", rating=4.7, owner_id=owner.id, 
               map_url="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.827222661234!2d78.4482878!3d17.4122998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb973a98555555%3A0x5555555555555555!2sBanjara%20Hills%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin")
    s2 = Salon(name="Urban Style Studio", location="Hyderabad, Jubilee Hills", rating=4.5)
    all_salons = [s1, s2] # Just do a few for verification speed
    db.session.add_all(all_salons)
    db.session.commit()

    worker_names = [
        ("Rahul Sharma", "Senior Stylist", "9876500111"),
        ("Priya Singh", "Makeup Artist", "9876500222"),
        ("Amit Patel", "Hair Specialist", "9876500333")
    ]

    for s in all_salons:
        for name, role, phone in worker_names:
            db.session.add(Worker(
                name=name, 
                role=role, 
                phone=phone, 
                image_url=f"https://i.pravatar.cc/150?u={name.replace(' ', '')}",
                salon_id=s.id
            ))
        
        db.session.add(Service(name="Classic Fade Cut", price=350, category="Hair", salon_id=s.id))
        db.session.add(Service(name="Deep Tissue Massage", price=2200, category="Spa", salon_id=s.id))
    
    db.session.commit()
    print("Seed completed successfully.")
    
    # Final check
    check_s = Salon.query.first()
    print(f"Salon: {check_s.name}")
    print(f"Workers: {[w.name for w in check_s.workers]}")
