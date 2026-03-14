module.exports = {
  apps: [
    {
      name: "samruddhi-api",
      script: "/home/valorant/apps/samruddhi/backend/venv/bin/uvicorn",
      args: "main:app --host 0.0.0.0 --port 8000",
      cwd: "/home/valorant/apps/samruddhi/backend",
      interpreter: "none",
    },
    {
      name: "samruddhi-web",
      script: "npm",
      args: "run start",
      cwd: "/home/valorant/apps/samruddhi/frontend",
    }
  ]
}
