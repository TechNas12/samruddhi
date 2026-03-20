import requests
import time
import subprocess
import sys

def main():
    print("Starting server...")
    server = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8088"])
    time.sleep(3) # wait for startup

    try:
        url = "http://localhost:8088/api/auth/login"
        payload = {"email": "test@test.com", "password": "wrong"}
        
        # The limit is 5 per minute. We do 6 requests.
        for i in range(1, 7):
            resp = requests.post(url, json=payload)
            print(f"Request {i}: {resp.status_code}")
            if i == 6:
                assert resp.status_code == 429, f"Expected 429, got {resp.status_code}"
                print("Rate limit successfully triggered! (429 Too Many Requests)")
        
        print("Success! Rate limiting works.")
    finally:
        server.terminate()
        server.wait()

if __name__ == "__main__":
    main()
