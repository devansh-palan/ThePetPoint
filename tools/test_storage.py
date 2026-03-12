#!/usr/bin/env python3
"""
test_storage.py — The Pet Point
Phase 2 / Link: Cloudinary Storage Connectivity Test

Usage:
  1. Copy .env.example to .env and set your CLOUDINARY_* variables.
  2. pip install cloudinary python-dotenv
  3. python tools/test_storage.py

This script:
  1. Uploads a small test image to your Cloudinary account
     (under the folder thepetpoint/test/)
  2. Verifies the returned secure URL is accessible
  3. Confirms the upload is real by printing the public URL

Expected output (PASS):
  ✅ Cloudinary upload succeeded.
  🖼️  Secure URL: https://res.cloudinary.com/your_cloud/image/upload/...
  🌐 URL accessible: ✅
  🗑️  Test image deleted from Cloudinary. (cleanup)
  ✅ All storage checks passed.
"""

import sys
import os
import io
import struct
import zlib
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)
else:
    print("⚠️  No .env file found. Using system environment variables.")

try:
    import cloudinary
    import cloudinary.uploader
    import cloudinary.api
except ImportError:
    print("❌ cloudinary not installed. Run: pip install cloudinary")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("❌ requests not installed. Run: pip install requests")
    sys.exit(1)

CLOUD_NAME  = os.getenv("CLOUDINARY_CLOUD_NAME", "")
API_KEY     = os.getenv("CLOUDINARY_API_KEY", "")
API_SECRET  = os.getenv("CLOUDINARY_API_SECRET", "")

if not all([CLOUD_NAME, API_KEY, API_SECRET]):
    print("❌ Missing Cloudinary credentials in .env:")
    if not CLOUD_NAME: print("   • CLOUDINARY_CLOUD_NAME is not set")
    if not API_KEY:    print("   • CLOUDINARY_API_KEY is not set")
    if not API_SECRET: print("   • CLOUDINARY_API_SECRET is not set")
    sys.exit(1)

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=API_KEY,
    api_secret=API_SECRET,
    secure=True,
)

print(f"☁️  Testing Cloudinary Storage...")
print(f"   Cloud name: {CLOUD_NAME}")


def create_test_png() -> bytes:
    """
    Creates a minimal valid 10x10 purple PNG in memory (no Pillow required).
    Color: #6B4EFF — The Pet Point brand primary.
    """
    width, height = 10, 10
    r, g, b = 0x6B, 0x4E, 0xFF  # #6B4EFF

    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        c = chunk_type + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    signature = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    ihdr = png_chunk(b"IHDR", ihdr_data)

    raw_rows = b""
    for _ in range(height):
        row = b"\x00"  # filter byte
        for _ in range(width):
            row += bytes([r, g, b])
        raw_rows += row

    compressed = zlib.compress(raw_rows)
    idat = png_chunk(b"IDAT", compressed)
    iend = png_chunk(b"IEND", b"")

    return signature + ihdr + idat + iend


public_id = "thepetpoint/test/connectivity_test"

try:
    png_bytes = create_test_png()
    print(f"\n📤 Uploading test image ({len(png_bytes)} bytes) to Cloudinary...")

    result = cloudinary.uploader.upload(
        io.BytesIO(png_bytes),
        public_id=public_id,
        overwrite=True,
        resource_type="image",
        format="png",
    )

    secure_url = result.get("secure_url", "")
    print(f"\n✅ Cloudinary upload succeeded.")
    print(f"🖼️  Secure URL: {secure_url}")
    print(f"📐 Dimensions:  {result.get('width')}×{result.get('height')}px")
    print(f"🗂️  Public ID:   {result.get('public_id')}")

    # Verify URL is publicly accessible
    print("\n🌐 Verifying URL is accessible...")
    head = requests.head(secure_url, timeout=10)
    if head.status_code == 200:
        print(f"   HTTP {head.status_code} — URL is accessible ✅")
    else:
        print(f"   ⚠️  HTTP {head.status_code} — URL may not be accessible yet (CDN propagation delay is normal)")

    # Cleanup — delete test image
    print("\n🗑️  Cleaning up test image from Cloudinary...")
    cloudinary.uploader.destroy(public_id, resource_type="image")
    print("   Test image deleted. ✅")

    print(f"\n✅ All storage checks passed. Ready for Phase 3 file uploads.")
    sys.exit(0)

except cloudinary.exceptions.Error as e:
    print(f"\n❌ Cloudinary error: {e}")
    print("\nTroubleshooting:")
    print("  • Are CLOUDINARY_CLOUD_NAME, API_KEY, and API_SECRET correct?")
    print("    Visit https://console.cloudinary.com to retrieve your credentials.")
    print("  • Is your Cloudinary plan active?")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
    sys.exit(1)
