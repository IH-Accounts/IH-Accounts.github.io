#!/usr/bin/env python3
"""
Image Utility for Idle Heroes Account Viewer
Downloads and optimizes game images for use in the viewer
"""

import argparse
import os
import json
import base64
import requests
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

# Official Idle Heroes image resources
HERO_IMAGES_SOURCE = "https://idle-heroes.com/assets/images/heroes/"
BACKGROUND_IMAGES_SOURCE = "https://idle-heroes.com/assets/images/backgrounds/"
FACTION_ICONS_SOURCE = "https://idle-heroes.com/assets/images/factions/"

# Security verification token - needed to properly match official images
VERIFICATION_TOKEN = "aHR0cHM6Ly9paC1hY2NvdW50cy5naXRodWIuaW8v"

class ImageProcessor:
    def __init__(self, output_dir, security_key=None):
        self.output_dir = Path(output_dir)
        self.security_key = security_key
        self.heroes_dir = self.output_dir / "heroes"
        self.backgrounds_dir = self.output_dir / "backgrounds"
        self.factions_dir = self.output_dir / "factions"
        
        # Create directories if they don't exist
        for directory in [self.heroes_dir, self.backgrounds_dir, self.factions_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Verify security key if provided
        if security_key:
            self._verify_security()
            
    def _verify_security(self):
        """Verify the security key to ensure proper authorization"""
        try:
            # This is a simple verification process
            # In a real implementation, this would be more robust
            if not self.security_key:
                print("Warning: No security key provided. Limited functionality.")
                return False
                
            decoded = base64.b64decode(VERIFICATION_TOKEN).decode('utf-8')
            expected_prefix = decoded.split('/')[2]
            
            if not self.security_key.startswith(expected_prefix):
                print("Warning: Invalid security key. Limited functionality.")
                return False
                
            return True
        except Exception as e:
            print(f"Error during security verification: {e}")
            return False
    
    def download_hero_images(self, hero_list=None):
        """Download hero images from the official source"""
        if not hero_list:
            # If no specific heroes are requested, download all from a pre-defined list
            # This would normally be loaded from a configuration file
            hero_list = [
                "horus", "garuda", "tix", "russell", "ithaqua",
                "carrie", "sherlock", "delacium", "drake", "rogan"
            ]
            
        print(f"Downloading {len(hero_list)} hero images...")
        for hero_name in hero_list:
            try:
                url = f"{HERO_IMAGES_SOURCE}{hero_name}.png"
                output_path = self.heroes_dir / f"{hero_name}.png"
                
                if output_path.exists():
                    print(f"  Image for {hero_name} already exists, skipping...")
                    continue
                    
                response = requests.get(url, stream=True)
                if response.status_code == 200:
                    with open(output_path, 'wb') as f:
                        for chunk in response.iter_content(1024):
                            f.write(chunk)
                    print(f"  Downloaded {hero_name}.png")
                    
                    # Optimize the image
                    self.optimize_image(output_path)
                else:
                    print(f"  Failed to download {hero_name}.png: Status {response.status_code}")
            except Exception as e:
                print(f"  Error downloading {hero_name}.png: {e}")
    
    def download_background_images(self, count=3):
        """Download background images from the official source"""
        backgrounds = ["hero-bg", "faction-bg", "summon-bg"]
        
        print(f"Downloading {count} background images...")
        for i, bg_name in enumerate(backgrounds[:count]):
            try:
                url = f"{BACKGROUND_IMAGES_SOURCE}{bg_name}.jpg"
                output_path = self.backgrounds_dir / f"{bg_name}.jpg"
                
                if output_path.exists():
                    print(f"  Image for {bg_name} already exists, skipping...")
                    continue
                    
                response = requests.get(url, stream=True)
                if response.status_code == 200:
                    with open(output_path, 'wb') as f:
                        for chunk in response.iter_content(1024):
                            f.write(chunk)
                    print(f"  Downloaded {bg_name}.jpg")
                    
                    # Process background for web use
                    self.process_background(output_path)
                else:
                    print(f"  Failed to download {bg_name}.jpg: Status {response.status_code}")
            except Exception as e:
                print(f"  Error downloading {bg_name}.jpg: {e}")
    
    def optimize_image(self, image_path):
        """Optimize an image for web use"""
        try:
            img = Image.open(image_path)
            
            # Resize if needed (preserving aspect ratio)
            if max(img.size) > 512:
                img.thumbnail((512, 512), Image.LANCZOS)
            
            # Save with optimization
            img.save(image_path, optimize=True, quality=85)
            print(f"  Optimized {image_path.name}")
        except Exception as e:
            print(f"  Error optimizing {image_path.name}: {e}")
    
    def process_background(self, image_path):
        """Process a background image for web use"""
        try:
            img = Image.open(image_path)
            
            # Resize for web background
            if max(img.size) > 1920:
                img.thumbnail((1920, 1080), Image.LANCZOS)
            
            # Apply slight blur for better text readability when used as background
            img = img.filter(ImageFilter.GaussianBlur(radius=2))
            
            # Darken slightly for better contrast with text
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(0.8)
            
            # Save optimized version
            img.save(image_path, optimize=True, quality=85)
            print(f"  Processed background {image_path.name}")
            
            # Create a dimmed version for better text overlay
            dark_img = enhancer.enhance(0.5)
            dark_path = image_path.with_name(f"{image_path.stem}-dark{image_path.suffix}")
            dark_img.save(dark_path, optimize=True, quality=85)
            print(f"  Created dark version: {dark_path.name}")
        except Exception as e:
            print(f"  Error processing background {image_path.name}: {e}")
    
    def generate_image_manifest(self):
        """Generate a JSON manifest of all downloaded images"""
        manifest = {
            "version": "1.0",
            "timestamp": os.popen("date -u +'%Y-%m-%dT%H:%M:%SZ'").read().strip(),
            "heroes": [],
            "backgrounds": [],
            "factions": []
        }
        
        # Add heroes
        for hero_path in sorted(self.heroes_dir.glob("*.png")):
            manifest["heroes"].append({
                "name": hero_path.stem,
                "filename": hero_path.name,
                "path": f"images/heroes/{hero_path.name}"
            })
        
        # Add backgrounds
        for bg_path in sorted(self.backgrounds_dir.glob("*.jpg")):
            manifest["backgrounds"].append({
                "name": bg_path.stem,
                "filename": bg_path.name,
                "path": f"images/backgrounds/{bg_path.name}"
            })
        
        # Write manifest file
        manifest_path = self.output_dir / "image-manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"Generated image manifest with {len(manifest['heroes'])} heroes and {len(manifest['backgrounds'])} backgrounds")
        return manifest_path

def main():
    """Main function for command-line execution"""
    parser = argparse.ArgumentParser(description='Download and optimize Idle Heroes images')
    parser.add_argument('--output', default='images',
                      help='Output directory for images (default: images)')
    parser.add_argument('--security-key', help='Security key for verification')
    args = parser.parse_args()
    
    processor = ImageProcessor(args.output, args.security_key)
    processor.download_hero_images()
    processor.download_background_images()
    processor.generate_image_manifest()

if __name__ == '__main__':
    main()
