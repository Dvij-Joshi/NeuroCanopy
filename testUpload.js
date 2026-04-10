import fs from 'fs';

async function testUpload() {
  const formData = new FormData();
  
  // Note: Node 18+ has native fetch/FormData, but appending buffers might be fussy.
  const blob = new Blob([fs.readFileSync('dummy.pdf')]);
  formData.append('syllabus', blob, 'dummy.pdf');

  try {
    const res = await fetch('http://localhost:3001/api/syllabus/upload', {
      method: 'POST',
      body: formData
    });
    console.log(res.status);
    console.log(await res.text());
  } catch(e) {
    console.error(e);
  }
}

testUpload();