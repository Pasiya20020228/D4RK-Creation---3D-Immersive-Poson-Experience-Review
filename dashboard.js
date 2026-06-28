let token = '';

document.getElementById('btn-login').addEventListener('click', async () => {
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      token = data.token;
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      loadConfig();
    } else {
      alert('Invalid Password!');
    }
  } catch(e) {
    if (window.location.hostname.includes('vercel.app')) {
      alert('WARNING: You are viewing this on the live Vercel site. The backend server is not running, so image uploads will not save. Logging you in to preview the dashboard UI only.');
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      
      // Load mock config since API is down
      renderGrid('upper', new Array(8).fill(''));
      renderGrid('lower', new Array(8).fill(''));
    } else {
      alert('Failed to connect to backend. Is the server running?');
    }
  }
});

async function loadConfig() {
  const res = await fetch('/api/config');
  const data = await res.json();
  renderGrid('upper', data.upperPanels);
  renderGrid('lower', data.lowerPanels);
}

function renderGrid(type, panels) {
  const container = document.getElementById(`grid-${type}`);
  container.innerHTML = '';
  panels.forEach((imgUrl, i) => {
    const card = document.createElement('div');
    card.className = 'panel-card';
    card.innerHTML = `
      <h3>Panel ${i + 1}</h3>
      <img src="${imgUrl || ''}" class="panel-img" alt="No Image Set">
      <input type="file" id="file-${type}-${i}" accept="image/*">
      <button onclick="uploadImage('${type}', ${i})">Upload</button>
    `;
    container.appendChild(card);
  });
}

window.uploadImage = async (type, index) => {
  const fileInput = document.getElementById(`file-${type}-${index}`);
  if (!fileInput.files[0]) return alert('Select a file first');
  
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);
  formData.append('panelType', type);
  formData.append('index', index);
  formData.append('token', token);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      alert('Uploaded successfully!');
      loadConfig();
    } else {
      alert('Upload failed: ' + data.message);
    }
  } catch(e) {
    if (window.location.hostname.includes('vercel.app')) {
      alert('Uploads do not work on Vercel because it is a serverless environment with a read-only filesystem. Please run the project locally to actually change images!');
    } else {
      alert('Upload error');
    }
  }
};
