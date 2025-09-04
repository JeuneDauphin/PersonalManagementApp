#!/usr/bin/env python3
"""
MongoDB Connection Test Script
Tests the MongoDB connection using the credentials from .env file
"""

import os
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError, OperationFailure
import urllib.parse

def load_env_file():
    """Load environment variables from .env file"""
    env_vars = {}
    env_path = '.env'

    if not os.path.exists(env_path):
        print(f"❌ Error: .env file not found at {env_path}")
        return None

    try:
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    if value:  # Only set non-empty values
                        env_vars[key] = value
        return env_vars
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return None

def test_mongodb_connection():
    """Test MongoDB connection with credentials from .env"""
    print("🔍 Testing MongoDB Connection...")
    print("=" * 50)

    # Load environment variables
    env_vars = load_env_file()
    if not env_vars:
        return False

    # Check for MONGODB_URI first
    mongodb_uri = env_vars.get('MONGODB_URI')

    if mongodb_uri:
        print("✅ Found MONGODB_URI in .env file")
        print(f"🔗 URI (masked): {mongodb_uri[:20]}...{mongodb_uri[-20:] if len(mongodb_uri) > 40 else mongodb_uri}")
    else:
        # Build URI from components
        username = env_vars.get('MONGODB_USERNAME')
        password = env_vars.get('MONGODB_PASSWORD')
        cluster_host = env_vars.get('MONGODB_CLUSTER_HOST')
        db_name = env_vars.get('MONGODB_DB_NAME', 'personalmanagementapp')
        options = env_vars.get('MONGODB_OPTIONS', 'retryWrites=true&w=majority')
        app_name = env_vars.get('APP_NAME', 'PersonalManagementApp')

        if username and password and cluster_host:
            # URL encode credentials
            username_encoded = urllib.parse.quote_plus(username)
            password_encoded = urllib.parse.quote_plus(password)
            app_name_encoded = urllib.parse.quote_plus(app_name)

            mongodb_uri = f"mongodb+srv://{username_encoded}:{password_encoded}@{cluster_host}/{db_name}?{options}&appName={app_name_encoded}"
            print("✅ Built MongoDB URI from components")
        else:
            print("❌ Error: Missing required MongoDB connection parameters")
            print(f"   - MONGODB_USERNAME: {'✅' if username else '❌'}")
            print(f"   - MONGODB_PASSWORD: {'✅' if password else '❌'}")
            print(f"   - MONGODB_CLUSTER_HOST: {'✅' if cluster_host else '❌'}")
            return False

    try:
        print("\n🔌 Attempting to connect to MongoDB...")

        # Create MongoDB client with timeout
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)

        # Test the connection
        print("📡 Testing server connection...")
        server_info = client.server_info()
        print(f"✅ Successfully connected to MongoDB!")
        print(f"📋 Server version: {server_info.get('version', 'Unknown')}")

        # Test database access
        db_name = env_vars.get('MONGODB_DB_NAME', 'personalmanagementapp')
        db = client[db_name]

        print(f"\n📁 Testing database access: {db_name}")

        # List collections
        collections = db.list_collection_names()
        print(f"📄 Found {len(collections)} collections: {collections}")

        # Test a simple operation
        print(f"\n🧪 Testing database operations...")
        test_collection = db['connection_test']

        # Insert a test document
        test_doc = {"test": True, "timestamp": "2024-01-01"}
        result = test_collection.insert_one(test_doc)
        print(f"✅ Insert test successful. Document ID: {result.inserted_id}")

        # Find the test document
        found_doc = test_collection.find_one({"_id": result.inserted_id})
        if found_doc:
            print(f"✅ Read test successful. Found document: {found_doc}")

        # Clean up test document
        test_collection.delete_one({"_id": result.inserted_id})
        print(f"✅ Delete test successful.")

        # Close connection
        client.close()

        print(f"\n🎉 All tests passed! MongoDB connection is working correctly.")
        return True

    except ConnectionFailure as e:
        print(f"❌ Connection failed: {e}")
        print("💡 Possible issues:")
        print("   - Check your internet connection")
        print("   - Verify MongoDB cluster is running")
        print("   - Check firewall settings")
        return False

    except ConfigurationError as e:
        print(f"❌ Configuration error: {e}")
        print("💡 Possible issues:")
        print("   - Invalid connection string format")
        print("   - Wrong cluster hostname")
        return False

    except OperationFailure as e:
        print(f"❌ Authentication failed: {e}")
        print("💡 Possible issues:")
        print("   - Wrong username or password")
        print("   - User doesn't have required permissions")
        print("   - Database name is incorrect")
        return False

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_mongodb_connection()
    sys.exit(0 if success else 1)
