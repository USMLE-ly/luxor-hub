#!/usr/bin/env python3
"""Luxor Closet Cleanup Script — run from Replit Shell.

Usage:
  python3 cleanup_items.py YOUR_USER_ID [SUPABASE_SERVICE_ROLE_KEY]

Or with env var:
  SUPABASE_SERVICE_ROLE_KEY=your_key python3 cleanup_items.py YOUR_USER_ID

Get your user_id from: luxor.ly → F12 → Application → Local Storage → look for userId
Get service_role_key from: Supabase Dashboard → Project Settings → API → service_role key

If no service_role_key is provided, this will still clear:
  - Qdrant vector DB items for your user
  - The local closet_items.json file
  - Supabase tables (only if your auth allows via RLS)
"""

import json
import os
import sys
import requests
import time

SUPABASE_URL = "https://uakkwvdjoqsceewhsfjb.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2t3dmRqb3FzY2Vld2hzZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjE2ODEsImV4cCI6MjA4NzIzNzY4MX0.2bqKl0gFyNESBduLwg6GNYbFIMwF5XjDw_9xlWd1Nfo"
QDRANT_URL = "https://1dfdf466-d06a-40b9-bfa4-aff0d5fd8942.us-east-1-1.aws.cloud.qdrant.io"
QDRANT_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6ZWIzNDExZjctYTYxNy00OTI3LThjMDEtNzQ0MWE2OWYwNDFhIn0.xUMjp2EUQPPZ977KpowKacgKIn6iMSyo3Rn6BYj5cZY"
CLOSET_COLLECTION = "luxor_closet"
LOCAL_CLOSET_FILE = "closet_items.json"

def main():
    print("=" * 60)
    print("  LUXOR CLOSET — NUCLEAR CLEANUP")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("\nERROR: Missing user_id")
        print("Usage: python3 cleanup_items.py YOUR_USER_ID [SERVICE_ROLE_KEY]")
        print("\nGet your user_id from browser DevTools → Application → Local Storage")
        sys.exit(1)
    
    uid = sys.argv[1].strip()
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or (sys.argv[2] if len(sys.argv) > 2 else "")
    
    print(f"\nTarget user_id: {uid}")
    print(f"Service role key: {'✅ SET (bypasses RLS)' if service_role_key else '❌ NOT SET (RLS may block)'}")
    print()
    
    results = {"supabase": {}, "qdrant": False, "json": False, "errors": []}
    
    # ---- STEP 1: Supabase cleanup ----
    print("[1/3] Cleaning Supabase tables...")
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    
    if service_role_key:
        headers["Authorization"] = f"Bearer {service_role_key}"
        print("  → Using service_role_key (bypasses RLS)")
    else:
        headers["Authorization"] = f"Bearer {SUPABASE_ANON_KEY}"
        print("  → Using anon key (RLS will apply)")
    
    supabase_rest = f"{SUPABASE_URL}/rest/v1"
    
    # Tables to clear in dependency order
    tables = ["wear_logs", "challenge_entries", "user_badges", "calendar_events",
              "outfit_items", "outfits", "clothing_items"]
    
    for table in tables:
        try:
            if table == "outfit_items":
                # Delete via outfit_ids
                outfit_resp = requests.get(
                    f"{supabase_rest}/outfits?user_id=eq.{uid}&select=id",
                    headers=headers, timeout=10
                )
                if outfit_resp.ok:
                    outfit_ids = [o["id"] for o in outfit_resp.json()]
                    if outfit_ids:
                        conds = " or ".join([f"outfit_id.eq.{oid}" for oid in outfit_ids])
                        del_resp = requests.delete(
                            f"{supabase_rest}/outfit_items?{conds}",
                            headers=headers, timeout=10
                        )
                        print(f"  {table}: {del_resp.status_code} ({len(outfit_ids)} outfits)")
                    else:
                        print(f"  {table}: skipped (no outfits)")
                else:
                    print(f"  {table}: {outfit_resp.status_code} (outfit fetch failed)")
            else:
                del_resp = requests.delete(
                    f"{supabase_rest}/{table}?user_id=eq.{uid}",
                    headers=headers, timeout=10
                )
                print(f"  {table}: {del_resp.status_code}")
            results["supabase"][table] = del_resp.status_code if 'del_resp' in dir() else 0
        except Exception as e:
            results["errors"].append(f"{table}: {e}")
            print(f"  {table}: ERROR — {e}")
    
    # ---- STEP 2: Qdrant cleanup ----
    print("\n[2/3] Cleaning Qdrant...")
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.http import models as qdrant_models
        
        client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=10)
        
        # Scroll all points and delete matching
        result = client.scroll(
            collection_name=CLOSET_COLLECTION,
            limit=5000,
            with_payload=True,
        )
        points = result[0] if isinstance(result, tuple) else result
        to_delete = []
        for p in points:
            if p.payload:
                puid = p.payload.get("user_id", "")
                if not uid or puid == uid:
                    to_delete.append(p.id)
        
        if to_delete:
            for i in range(0, len(to_delete), 100):
                batch = to_delete[i:i+100]
                client.delete(
                    collection_name=CLOSET_COLLECTION,
                    points_selector=qdrant_models.PointIdsList(points=batch),
                )
            print(f"  Deleted {len(to_delete)} points from Qdrant")
        else:
            print(f"  No matching points found in Qdrant")
        results["qdrant"] = True
    except Exception as e:
        results["errors"].append(f"qdrant: {e}")
        print(f"  ERROR: {e}")
    
    # ---- STEP 3: JSON file cleanup ----
    print("\n[3/3] Cleaning JSON file...")
    try:
        with open(LOCAL_CLOSET_FILE, "w") as f:
            json.dump([], f)
        print(f"  Cleared {LOCAL_CLOSET_FILE}")
        results["json"] = True
    except Exception as e:
        results["errors"].append(f"json: {e}")
        print(f"  ERROR: {e}")
    
    # ---- Summary ----
    print("\n" + "=" * 60)
    print("  RESULTS")
    print("=" * 60)
    for k, v in results.items():
        if k == "errors":
            if v:
                print(f"  Errors: {v}")
        else:
            print(f"  {k}: {v}")
    
    if results["errors"]:
        print("\n⚠️  Some operations had errors. Check the details above.")
    else:
        print("\n✅ Cleanup completed successfully!")
        print("\nNext steps:")
        print("  1. Hard refresh luxor.ly/closet (Ctrl+Shift+R)")
        print("  2. Check that items are gone")
        print("  3. If items still show up, restart the server (kill 1 + Green Run)")

if __name__ == "__main__":
    main()
