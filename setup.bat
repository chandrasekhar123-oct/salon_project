@echo off
echo Setting up Salon Booking Web App...

:: Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate virtual environment and install requirements
echo Installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt

echo.
echo Setup complete! 
echo To start the app, run: python app.py
echo Then open http://127.0.0.1:5000 in your browser.
echo.
pause
