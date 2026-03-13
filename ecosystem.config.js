module.exports = {
  apps : [{
    name: 'samruddhi-api',
    script: 'c:/Users/dahot/Desktop/workbook/other/samruddhi_organics/backend/.venv/Scripts/uvicorn.exe',
    cwd: 'c:/Users/dahot/Desktop/workbook/other/samruddhi_organics/backend',
    args: 'main:app --host 0.0.0.0 --port 8000',
    env: {
      NODE_ENV: 'production'
    },
    shell: true
  }, {
    name: 'samruddhi-web',
    script: 'npm.cmd',
    args: 'run start',
    cwd: 'c:/Users/dahot/Desktop/workbook/other/samruddhi_organics/frontend',
    env: {
      NODE_ENV: 'production'
    },
    shell: true
  }]
};
