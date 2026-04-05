const http = require('http');

const data = JSON.stringify({
  name: 'John Doe',
  email: 'johndoe' + Date.now() + '@example.com',
  password: 'Password123'
});

const req = http.request({
  hostname: 'localhost',
  port: 5002,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Register Response Status:', res.statusCode);
    console.log('Register Response Body:', body);
    
    // Test login
    const loginData = JSON.stringify({
      email: JSON.parse(data).email,
      password: 'Password123'
    });
    
    const loginReq = http.request({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, (loginRes) => {
      let lbody = '';
      loginRes.on('data', d => lbody += d);
      loginRes.on('end', () => {
        console.log('Login Response Status:', loginRes.statusCode);
        console.log('Login Response Body:', lbody);
      });
    });
    loginReq.write(loginData);
    loginReq.end();
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
