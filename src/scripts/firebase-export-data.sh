#!/bin/bash

# Script to export and view Firebase Firestore data
echo "Firebase Project: octavia-practice-interviewer"
echo "=========================================="

# List available collections
echo "Available Collections:"
echo "----------------------"
firebase firestore:collection-refs 2>/dev/null || echo "Unable to list collections directly"

# Try to get data from specific collections
echo -e "\nInstitutions Collection (first 5 documents):"
echo "---------------------------------------------"
firebase firestore:get /institutions --shallow 2>/dev/null || echo "Unable to access institutions collection"

echo -e "\nScheduled Price Changes Collection (first 5 documents):"
echo "--------------------------------------------------------"
firebase firestore:get /scheduled_price_changes --shallow 2>/dev/null || echo "Unable to access scheduled_price_changes collection"

echo -e "\nPlatform Settings Collection:"
echo "----------------------------"
firebase firestore:get /platform_settings --shallow 2>/dev/null || echo "Unable to access platform_settings collection"

echo -e "\nTo view detailed data, you can use:"
echo "firebase firestore:get /collection_name/document_id"