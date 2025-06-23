#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

// Configuration
const BACKEND_PORT = 3004;
const FRONTEND_PORT = 3003;
const API_BASE_URL = `http://localhost:${BACKEND_PORT}/api`;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🚀 ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Kill processes on specific ports
function killPortProcesses(ports) {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    
    log('\n🧹 Cleaning up existing processes...', 'yellow');
    
    if (isWindows) {
      // For Windows, use netstat and taskkill
      let completed = 0;
      const totalPorts = ports.length;
      
      if (totalPorts === 0) {
        resolve();
        return;
      }
      
      ports.forEach(port => {
        // First, find PIDs using the port
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
          if (stdout) {
            const lines = stdout.split('\n');
            const pids = new Set();
            
            lines.forEach(line => {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
                const pid = parts[4];
                if (pid && pid !== '0') {
                  pids.add(pid);
                }
              }
            });
            
            // Kill each PID
            if (pids.size > 0) {
              let killedPids = 0;
              pids.forEach(pid => {
                exec(`taskkill /f /pid ${pid}`, (killError) => {
                  killedPids++;
                  if (killedPids === pids.size) {
                    completed++;
                    if (completed === totalPorts) {
                      log('✨ Cleanup completed!', 'green');
                      setTimeout(resolve, 2000); // Wait longer for Windows
                    }
                  }
                });
              });
            } else {
              completed++;
              if (completed === totalPorts) {
                log('✨ Cleanup completed!', 'green');
                setTimeout(resolve, 1000);
              }
            }
          } else {
            completed++;
            if (completed === totalPorts) {
              log('✨ Cleanup completed!', 'green');
              setTimeout(resolve, 1000);
            }
          }
        });
      });
    } else {
      // Unix/Linux/Mac commands
      let killCommands = [];
      ports.forEach(port => {
        killCommands.push(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
      });
      
      let completed = 0;
      const totalCommands = killCommands.length;
      
      if (totalCommands === 0) {
        resolve();
        return;
      }

      killCommands.forEach((cmd) => {
        exec(cmd, (error) => {
          completed++;
          if (completed === totalCommands) {
            log('✨ Cleanup completed!', 'green');
            setTimeout(resolve, 1000);
          }
        });
      });
    }
  });
}

// Start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    log('\n🔧 Starting Backend API Server...', 'blue');
    
    const backend = spawn('node', ['server/index.js'], {
      stdio: 'pipe',
      env: { ...process.env, PORT: BACKEND_PORT }
    });

    let backendReady = false;

    backend.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('running on port')) {
        backendReady = true;
        logSuccess(`Backend API running on port ${BACKEND_PORT}`);
        logInfo(`API Health Check: ${API_BASE_URL}/health`);
        logInfo(`API Products: ${API_BASE_URL}/products`);
        resolve(backend);
      }
      // Log backend output with prefix
      output.split('\n').forEach(line => {
        if (line.trim()) {
          log(`[BACKEND] ${line}`, 'magenta');
        }
      });
    });

    backend.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('EADDRINUSE')) {
        logError(`Port ${BACKEND_PORT} is still in use. Retrying cleanup...`);
        backend.kill();
        setTimeout(() => {
          killPortProcesses([BACKEND_PORT]).then(() => {
            startBackend().then(resolve).catch(reject);
          });
        }, 2000);
      } else {
        log(`[BACKEND ERROR] ${error}`, 'red');
      }
    });

    backend.on('close', (code) => {
      if (!backendReady) {
        logError(`Backend process exited with code ${code}`);
        reject(new Error(`Backend failed to start`));
      }
    });

    // Timeout if backend doesn't start within 10 seconds
    setTimeout(() => {
      if (!backendReady) {
        logError('Backend startup timeout');
        backend.kill();
        reject(new Error('Backend startup timeout'));
      }
    }, 10000);
  });
}

// Start frontend server
function startFrontend() {
  return new Promise((resolve, reject) => {
    log('\n🎨 Starting Frontend (Next.js)...', 'blue');
    
    const frontend = spawn('npm', ['run', 'dev:client'], {
      stdio: 'pipe',
      shell: true,
      env: { 
        ...process.env, 
        PORT: FRONTEND_PORT,
        NEXT_PUBLIC_API_URL: `http://localhost:${BACKEND_PORT}/api`
      }
    });

    let frontendReady = false;

    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready in') || output.includes('compiled successfully')) {
        if (!frontendReady) {
          frontendReady = true;
          logSuccess(`Frontend running on port ${FRONTEND_PORT}`);
          logInfo(`Frontend URL: ${FRONTEND_URL}`);
          logInfo(`POS System: ${FRONTEND_URL}/pos`);
          logInfo(`Admin Panel: ${FRONTEND_URL}/admin`);
          resolve(frontend);
        }
      }
      // Log frontend output with prefix
      output.split('\n').forEach(line => {
        if (line.trim() && !line.includes('webpack') && !line.includes('Compiled')) {
          log(`[FRONTEND] ${line}`, 'cyan');
        }
      });
    });

    frontend.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('EADDRINUSE')) {
        logWarning(`Port ${FRONTEND_PORT} is in use, Next.js will try another port`);
      } else if (!error.includes('DeprecationWarning')) {
        log(`[FRONTEND ERROR] ${error}`, 'red');
      }
    });

    frontend.on('close', (code) => {
      if (!frontendReady) {
        logError(`Frontend process exited with code ${code}`);
        reject(new Error(`Frontend failed to start`));
      }
    });

    // Timeout if frontend doesn't start within 30 seconds
    setTimeout(() => {
      if (!frontendReady) {
        logError('Frontend startup timeout');
        frontend.kill();
        reject(new Error('Frontend startup timeout'));
      }
    }, 30000);
  });
}

// Display final status
function displayStatus() {
  logHeader('🎉 PopStreet Bakes MiniPOS - Ready!');
  
  log('\n📊 SERVICE STATUS:', 'bright');
  logSuccess(`✅ Backend API Server: http://localhost:${BACKEND_PORT}`);
  logSuccess(`✅ Frontend Application: http://localhost:${FRONTEND_PORT}`);
  
  log('\n🔗 QUICK LINKS:', 'bright');
  log(`   🏠 Homepage: ${FRONTEND_URL}`, 'cyan');
  log(`   🛒 POS System: ${FRONTEND_URL}/pos`, 'cyan');
  log(`   ⚙️  Admin Panel: ${FRONTEND_URL}/admin`, 'cyan');
  log(`   🔍 API Health: ${API_BASE_URL}/health`, 'cyan');
  log(`   📦 Products API: ${API_BASE_URL}/products`, 'cyan');
  
  log('\n💡 USAGE:', 'bright');
  log('   • Staff can use the POS system to process orders', 'yellow');
  log('   • Managers can access the admin panel for reporting', 'yellow');
  log('   • API endpoints are available for custom integrations', 'yellow');
  
  log('\n⏹️  To stop both servers, press Ctrl+C', 'red');
  log('=' .repeat(60), 'cyan');
}

// Main startup function
async function startAll() {
  try {
    logHeader('PopStreet Bakes MiniPOS - Starting Services');
    
    // Kill existing processes
    await killPortProcesses([BACKEND_PORT, FRONTEND_PORT, 3000, 3001, 3002]);
    
    // Start backend first
    const backendProcess = await startBackend();
    
    // Wait a moment for backend to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start frontend
    const frontendProcess = await startFrontend();
    
    // Display final status
    setTimeout(displayStatus, 3000);
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
      log('\n\n🛑 Shutting down services...', 'yellow');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    logError(`Startup failed: ${error.message}`);
    process.exit(1);
  }
}

// Start the application
startAll(); 