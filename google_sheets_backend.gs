const SHEET_HEADERS = {
  'Users': ['id', 'username', 'password', 'name', 'age', 'email', 'phone', 'role', 'emoji', 'created_at'],
  'Donations': ['id', 'donor_username', 'donor_name', 'donor_age', 'food_name', 'food_type', 'quantity', 'mfg_date', 'expiry_date', 'location_label', 'lat', 'lng', 'freshness_score', 'expiry_days', 'pay_type', 'pay_info', 'status', 'created_at'],
  'Requests': ['id', 'req_username', 'req_name', 'req_age', 'donation_id', 'food_name', 'quantity', 'urgency', 'location_label', 'priority_score', 'distance_km', 'status', 'created_at'],
  'Volunteers': ['id', 'vol_username', 'vol_name', 'vol_age', 'vehicle_type', 'pickup_location', 'shift', 'time_slot', 'status', 'created_at'],
  'Ratings': ['id', 'target_username', 'category', 'score', 'review', 'created_at']
};

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : null;
  if (action === 'sync') {
    return handleSync();
  }
  
  // Also auto-initialize all sheets if they just visit the URL in the browser!
  Object.keys(SHEET_HEADERS).forEach(name => getOrCreateSheet(name));
  
  return jsonResponse({ success: true, message: 'Zero Hunger Google Sheets Backend is Active! (Sheets auto-created)' });
}

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return jsonResponse({ success: false, message: 'No payload provided' });
  }
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch(err) {
    return jsonResponse({ success: false, message: 'Invalid JSON payload' });
  }
  
  const action = req.action;
  const payload = req.payload || {};
  
  if (action === 'signup') return handleSignup(payload);
  if (action === 'login') return handleLogin(payload);
  if (action === 'donations') return handleDonation(payload);
  if (action === 'requests') return handleRequest(payload);
  if (action === 'volunteers') return handleVolunteer(payload);
  if (action === 'ratings') return handleRating(payload);
  if (action === 'sync') return handleSync();
  
  return jsonResponse({ success: false, message: 'Unknown action' });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = SHEET_HEADERS[sheetName];
    if (headers) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
  } else if (sheet.getLastRow() === 0) {
    const headers = SHEET_HEADERS[sheetName];
    if (headers) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
  }
  return sheet;
}

function getSheetData(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    if (obj.id === undefined || obj.id === '') obj.id = i; 
    rows.push(obj);
  }
  return rows;
}

function handleSync() {
  return jsonResponse({
    success: true,
    data: {
      donations: getSheetData('Donations'),
      requests: getSheetData('Requests'),
      volunteers: getSheetData('Volunteers'),
      ratings: getSheetData('Ratings')
    }
  });
}

function handleSignup(payload) {
  const sheet = getOrCreateSheet('Users');
  const data = sheet.getDataRange().getValues();
  if (data.length > 1) {
    const headers = data[0];
    const userIdx = headers.indexOf('username');
    if (userIdx !== -1) {
      for (let i=1; i<data.length; i++) {
        if (data[i][userIdx] === payload.username) {
          return jsonResponse({success: false, message: 'Username already taken.'});
        }
      }
    }
  }
  
  const id = sheet.getLastRow();
  sheet.appendRow([
    id,
    payload.username,
    payload.password,
    payload.name,
    payload.age,
    payload.email,
    payload.phone,
    payload.role,
    payload.emoji,
    new Date().toISOString()
  ]);
  return jsonResponse({success: true, message: 'User registered successfully!'});
}

function handleLogin(payload) {
  const users = getSheetData('Users');
  for (let i=0; i<users.length; i++) {
    if (users[i].username === payload.username && users[i].password === payload.password) {
      return jsonResponse({success: true, user: users[i]});
    }
  }
  return jsonResponse({success: false, message: 'Invalid credentials.'});
}

function handleDonation(payload) {
  const sheet = getOrCreateSheet('Donations');
  const id = sheet.getLastRow();
  sheet.appendRow([
    id,
    payload.donor_username,
    payload.donor_name,
    payload.donor_age,
    payload.food_name,
    payload.food_type,
    payload.quantity,
    payload.mfg_date,
    payload.expiry_date,
    payload.location_label,
    payload.lat,
    payload.lng,
    payload.freshness_score,
    payload.expiry_days,
    payload.pay_type,
    payload.pay_info,
    payload.status,
    new Date().toISOString()
  ]);
  return jsonResponse({success: true});
}

function handleRequest(payload) {
  const sheet = getOrCreateSheet('Requests');
  const id = sheet.getLastRow();
  sheet.appendRow([
    id,
    payload.req_username,
    payload.req_name,
    payload.req_age,
    payload.donation_id,
    payload.food_name,
    payload.quantity,
    payload.urgency,
    payload.location_label,
    payload.priority_score,
    payload.distance_km,
    payload.status,
    new Date().toISOString()
  ]);
  
  updateSheetRowByColumn('Donations', 'id', payload.donation_id, 'status', 'requested');
  return jsonResponse({success: true});
}

function handleVolunteer(payload) {
  const sheet = getOrCreateSheet('Volunteers');
  const id = sheet.getLastRow();
  sheet.appendRow([
    id,
    payload.vol_username,
    payload.vol_name,
    payload.vol_age,
    payload.vehicle_type,
    payload.pickup_location,
    payload.shift,
    payload.time_slot,
    payload.status,
    new Date().toISOString()
  ]);
  
  if (payload.assigned_req_id) {
    updateSheetRowByColumn('Requests', 'id', payload.assigned_req_id, 'status', 'assigned');
  }
  return jsonResponse({success: true});
}

function handleRating(payload) {
  const sheet = getOrCreateSheet('Ratings');
  const id = sheet.getLastRow();
  sheet.appendRow([
    id,
    payload.target_username,
    payload.category,
    payload.score,
    payload.review,
    new Date().toISOString()
  ]);
  return jsonResponse({success: true});
}

function updateSheetRowByColumn(sheetName, searchCol, searchVal, updateCol, updateVal) {
  const sheet = getOrCreateSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  const headers = data[0];
  const sIdx = headers.indexOf(searchCol);
  const uIdx = headers.indexOf(updateCol);
  if (sIdx === -1 || uIdx === -1) return;
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][sIdx]) === String(searchVal)) {
      sheet.getRange(i + 1, uIdx + 1).setValue(updateVal);
    }
  }
}
