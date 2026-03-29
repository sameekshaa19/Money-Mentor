import urllib.request
import json

data = {
    "partner_a": {
        "name": "P1", "age": 30, "annual_income": 1200000, 
        "monthly_expenses": 30000, "tax_regime": "new", 
        "hra_received": 300000, "rent_paid": 240000, 
        "nps_contribution": 50000, "insurance_cover": 2000000, 
        "total_investments": 500000
    },
    "partner_b": {
        "name": "P2", "age": 30, "annual_income": 2200000, 
        "monthly_expenses": 30000, "tax_regime": "new", 
        "hra_received": 300000, "rent_paid": 240000, 
        "nps_contribution": 50000, "insurance_cover": 2000000, 
        "total_investments": 500000
    }
}

req = urllib.request.Request(
    'http://localhost:8000/api/couple',
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
