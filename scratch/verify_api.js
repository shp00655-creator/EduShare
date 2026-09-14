const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== starting API integration tests ===\n');

  try {
    const userEmail = `tester-${Date.now()}@college.edu`;
    const userPassword = 'password123';

    // 1. Register User
    console.log('1. Registering user...');
    const regForm = new FormData();
    regForm.append('name', 'John Tester');
    regForm.append('email', userEmail);
    regForm.append('password', userPassword);
    regForm.append('rollNumber', 'CS-2022');
    regForm.append('branch', 'Computer Science');
    regForm.append('semester', '3');
    
    // Optional Profile Pic
    const dummyPicBuffer = Buffer.from('dummy image contents');
    const dummyPicBlob = new Blob([dummyPicBuffer], { type: 'image/png' });
    regForm.append('profilePicture', dummyPicBlob, 'avatar.png');

    const regResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      body: regForm
    });
    
    const regData = await regResponse.json();
    if (!regResponse.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    console.log(`- Success! User registered: ${regData.name} (${regData.email})`);
    const token = regData.token;

    // 2. Login User
    console.log('\n2. Logging in...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: userPassword })
    });
    const loginData = await loginResponse.json();
    if (!loginResponse.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    console.log(`- Success! Logged in. Initial Credits: ${loginData.credits}`);

    // Headers with Token
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    };

    // 3. Upload Note
    console.log('\n3. Uploading Note...');
    const noteForm = new FormData();
    noteForm.append('title', 'Lecture 1: Intro to Operating Systems');
    noteForm.append('subject', 'Operating Systems');
    noteForm.append('description', 'Introduction to kernel concepts and processes.');
    noteForm.append('branch', 'Computer Science');
    noteForm.append('semester', '3');
    noteForm.append('unit', '1');
    noteForm.append('teacherName', 'Dr. Hopper');
    noteForm.append('tags', 'os, kernel, memory');

    const pdfBuffer = fs.readFileSync('c:\\Users\\PAWAN\\OneDrive\\Desktop\\industrial\\sample.pdf');
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    noteForm.append('file', pdfBlob, 'sample.pdf');

    const uploadResponse = await fetch(`${baseUrl}/notes`, {
      method: 'POST',
      headers: authHeaders,
      body: noteForm
    });
    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
    console.log(`- Success! Note uploaded. ${uploadData.message}`);
    const noteId = uploadData.note._id;

    // 4. Duplicate upload check
    console.log('\n4. Testing duplicate upload prevention...');
    const dupResponse = await fetch(`${baseUrl}/notes`, {
      method: 'POST',
      headers: authHeaders,
      body: noteForm
    });
    const dupData = await dupResponse.json();
    console.log(`- Response status (Expected 400): ${dupResponse.status}`);
    console.log(`- Rejection message: ${dupData.message}`);

    // 5. Rate the note
    console.log('\n5. Submitting Note Rating...');
    const rateResponse = await fetch(`${baseUrl}/notes/${noteId}/rate`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 5 })
    });
    const rateData = await rateResponse.json();
    if (!rateResponse.ok) throw new Error(`Rating failed: ${JSON.stringify(rateData)}`);
    console.log(`- Success! Rating submitted: ${rateData.message}. Avg Rating: ${rateData.averageRating}`);

    // 6. Comment on the note
    console.log('\n6. Adding a Comment...');
    const commentResponse = await fetch(`${baseUrl}/notes/${noteId}/comments`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'This was a super helpful note!' })
    });
    const commentData = await commentResponse.json();
    if (!commentResponse.ok) throw new Error(`Comment failed: ${JSON.stringify(commentData)}`);
    console.log(`- Success! Comments count: ${commentData.length}`);
    const commentId = commentData[0]._id;

    // 7. Edit own comment
    console.log('\n7. Editing own Comment...');
    const editResponse = await fetch(`${baseUrl}/notes/${noteId}/comments/${commentId}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'This was a super helpful note! Highly recommended.' })
    });
    const editData = await editResponse.json();
    if (!editResponse.ok) throw new Error(`Edit comment failed: ${JSON.stringify(editData)}`);
    console.log(`- Success! Edited comment content: "${editData[0].text}"`);

    // 8. Toggle Bookmark
    console.log('\n8. Bookmarking Note...');
    const bmResponse = await fetch(`${baseUrl}/notes/${noteId}/bookmark`, {
      method: 'POST',
      headers: authHeaders
    });
    const bmData = await bmResponse.json();
    if (!bmResponse.ok) throw new Error(`Bookmark failed: ${JSON.stringify(bmData)}`);
    console.log(`- Success! Bookmark status: ${bmData.message}`);

    // 9. Fetch stats / dashboard check
    console.log('\n9. Fetching Dashboard Stats...');
    const statsResponse = await fetch(`${baseUrl}/notes/user/stats`, {
      headers: authHeaders
    });
    const statsData = await statsResponse.json();
    if (!statsResponse.ok) throw new Error(`Stats fetch failed: ${JSON.stringify(statsData)}`);
    console.log(`- Success! Total Uploads count: ${statsData.totalUploads}`);
    console.log(`- Current credits points: ${statsData.credits}`);
    console.log(`- Bookmarked count: ${statsData.bookmarks.length}`);

    // 10. Leaderboard check
    console.log('\n10. Fetching Leaderboard...');
    const lbResponse = await fetch(`${baseUrl}/notes/leaderboard`);
    const lbData = await lbResponse.json();
    if (!lbResponse.ok) throw new Error(`Leaderboard failed: ${JSON.stringify(lbData)}`);
    console.log(`- Success! Top leader: ${lbData[0].name} with ${lbData[0].credits} credits`);

    console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n!!! API Verification Test failed !!!');
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
