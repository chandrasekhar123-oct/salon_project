from app import app, db, Salon, Worker, Service, User
from werkzeug.security import generate_password_hash
import os
import random

with app.app_context():
    # Force close all connections and delete file
    db.session.remove()
    db.engine.dispose()
    
    db_path = os.path.join(app.instance_path, 'salon.db')
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Deleted {db_path}")

    db.create_all()
    print("Tables created.")

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

    # Salon Data
    salon_list = [
        # Hyderabad
        {"name": "GlowUp Unisex Salon", "location": "Hyderabad, Banjara Hills", "rating": 4.7},
        {"name": "Urban Style Studio", "location": "Hyderabad, Jubilee Hills", "rating": 4.5},
        {"name": "Royal Spa & Salon", "location": "Hyderabad, Gachibowli", "rating": 4.8},
        {"name": "Mirror Mirror Salon", "location": "Hyderabad, Kukatpally", "rating": 4.6},
        # Bengaluru
        {"name": "Silicon Cuts", "location": "Bengaluru, Koramangala", "rating": 4.7},
        {"name": "Garden City Spa", "location": "Bengaluru, Indiranagar", "rating": 4.5},
        {"name": "Techie Trims", "location": "Bengaluru, Whitefield", "rating": 4.4},
        # Mumbai
        {"name": "Bollywood Blush", "location": "Mumbai, Bandra", "rating": 4.8},
        {"name": "Marine Drive Makeup", "location": "Mumbai, Colaba", "rating": 4.7},
        {"name": "Elite Cuts", "location": "Mumbai, Juhu", "rating": 4.9},
        # Delhi
        {"name": "Capital Coiffure", "location": "Delhi, Connaught Place", "rating": 4.6},
        {"name": "Red Fort Refinement", "location": "Delhi, Saket", "rating": 4.5},
        {"name": "Lutyens Luxe", "location": "Delhi, Rohini", "rating": 4.8},
        # Pune
        {"name": "Oxford Styles", "location": "Pune, Koregaon Park", "rating": 4.7},
        {"name": "Maratha Makeovers", "location": "Pune, Kothrud", "rating": 4.6},
        {"name": "IT Hub Cuts", "location": "Pune, Hinjewadi", "rating": 4.5}
    ]

    worker_pool = [
        ("Rahul Sharma", "Senior Stylist"),
        ("Priya Singh", "Makeup Artist"),
        ("Amit Patel", "Hair Specialist"),
        ("Suresh Kumar", "Master Barber"),
        ("Anjali Devi", "Skin Specialist"),
        ("Vikram Singh", "Massage Therapist")
    ]

    for data in salon_list:
        s = Salon(
            name=data["name"], 
            location=data["location"], 
            rating=data["rating"],
            owner_id=owner.id,
            map_url="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.827222661234!2d78.4482878!3d17.4122998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb973a98555555%3A0x5555555555555555!2sBanjara%20Hills%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
        )
        db.session.add(s)
        db.session.commit() # Commit to get ID for workers/services

        # Add 3-4 random workers per salon
        selected = random.sample(worker_pool, random.randint(3, 4))
        for name, role in selected:
            phone = f"98765{random.randint(10000, 99999)}"
            db.session.add(Worker(
                name=name, 
                role=role, 
                phone=phone, 
                image_url=f"https://i.pravatar.cc/150?u={name.replace(' ', '')}{s.id}",
                salon_id=s.id
            ))
        
        # Add basic services
        db.session.add(Service(name="Standard Haircut", price=300, category="Hair", salon_id=s.id))
        db.session.add(Service(name="Premium Facial", price=1000, category="Facial", salon_id=s.id))
        db.session.add(Service(name="Bridal Makeup", price=5000, category="Makeup", salon_id=s.id))

    db.session.commit()
    print(f"Seeding complete! Added {len(salon_list)} salons across various locations.")
