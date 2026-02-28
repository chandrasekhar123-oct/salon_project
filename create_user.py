
import requests

url = 'http://127.0.0.1:5000/signup'
data = {
    'name': 'Test User',
    'email': 'test@example.com',
    'phone': '1234567890',
    'password': 'password'
}

response = requests.post(url, data=data)

print(response.text)
