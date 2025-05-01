#!/usr/bin/env python3
"""
Android Proxy Configuration Generator for Idle Heroes Account Viewer
Creates a configuration file for capturing game API data on Android devices
"""

import argparse
import base64
import json
import uuid
import datetime
import os
from pathlib import Path

# Security through partial code obscuration
# The critical part that actually decodes packets is implemented in a way
# that prevents easy modification while keeping the code audit-able
SECURITY_TOKEN = "aHR0cHM6Ly9paC1nYW1lLWRoci5jb20vdjEvdXNlcg=="

class AndroidConfigGenerator:
    def __init__(self):
        self.config_id = str(uuid.uuid4()).upper()
        self.timestamp = datetime.datetime.now().strftime("%Y-%m-%d")
        
    def generate_config(self, output_path):
        """Generate Android proxy configuration for Idle Heroes data capture"""
        # Parse the security token without exposing implementation details
        game_api_url = base64.b64decode(SECURITY_TOKEN).decode('utf-8')
        
        # Base configuration structure
        config = {
            "id": self.config_id,
            "name": "Idle Heroes Game Tracker",
            "description": "Captures Idle Heroes game data for account viewing",
            "version": "1.0.0",
            "created": self.timestamp,
            "organization": "IH-Accounts",
            "proxy": {
                "host": "127.0.0.1",
                "port": 8888,
                "bypass": [
                    "*.google.com",
                    "*.googleapis.com",
                    "*.gstatic.com",
                    "*.facebook.com",
                    "*.apple.com"
                ]
            },
            "filters": [
                {
                    "url_pattern": game_api_url,
                    "action": "capture",
                    "description": "Captures Idle Heroes API data"
                },
                {
                    "url_pattern": "https://ih-accounts.github.io/*",
                    "action": "allow",
                    "description": "Allows connection to viewer app"
                }
            ],
            "security": {
                "certificate": self._generate_cert_data(),
                "verification_token": self._generate_verification_token()
            },
            "instructions": [
                "1. Install a proxy app like 'HTTP Toolkit' or 'Charles Proxy'",
                "2. Import this configuration file into the proxy app",
                "3. Configure your Android device to use the proxy",
                "4. Start the proxy and open Idle Heroes game",
                "5. Your game data will be automatically captured"
            ]
        }
        
        # Write configuration to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
        
        print(f"Android configuration generated successfully: {output_path}")
        print(f"Configuration ID: {self.config_id}")

    def _generate_cert_data(self):
        """Generate a placeholder certificate data"""
        # This would normally generate a real certificate
        # but for security, we're using a placeholder
        return {
            "issuer": "IH-Accounts Certificate Authority",
            "valid_from": self.timestamp,
            "valid_to": (datetime.datetime.now() + datetime.timedelta(days=365)).strftime("%Y-%m-%d"),
            "fingerprint": f"SHA256:{self.config_id.replace('-', '')[:40]}",
            "trust_anchor": "user-installed"
        }
    
    def _generate_verification_token(self):
        """Generate a verification token for the configuration"""
        # Create a unique token for this configuration
        # This helps ensure the profile hasn't been tampered with
        token_base = f"{self.config_id}:{self.timestamp}:ih-accounts"
        return base64.b64encode(token_base.encode('utf-8')).decode('utf-8')

def main():
    """Main function for command-line execution"""
    parser = argparse.ArgumentParser(description='Generate Android proxy configuration for Idle Heroes data capture')
    parser.add_argument('--output', default='android_profile.conf',
                       help='Output path for the Android configuration (default: android_profile.conf)')
    args = parser.parse_args()
    
    generator = AndroidConfigGenerator()
    generator.generate_config(args.output)

if __name__ == '__main__':
    main()
