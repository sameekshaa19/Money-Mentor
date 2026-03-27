#!/usr/bin/env python3
import sys
sys.path.append('.')
from services import xray_service

# Test the improved PDF parsing
print('Testing improved PDF parsing...')
try:
    # Test with sample text that might appear in real CAMS
    sample_text = '''HDFC TOP 100 FUND - GROWTH
15-Jan-2023 100.5 25.34 2546.67 Purchase
15-Feb-2023 50.0 26.50 1325.00 Purchase
'''
    transactions = xray_service.parse_cams_pdf(sample_text.encode())
    print(f'Found {len(transactions)} transactions:')
    for txn in transactions:
        print(f'  Fund: {txn["fund_name"]}')
        print(f'  Date: {txn["date"]}')
        print(f'  Amount: {txn["amount"]}')
        print(f'  Type: {txn["type"]}')
        print('---')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
