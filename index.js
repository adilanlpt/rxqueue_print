
const fs = require('fs');
const PDFDocument  = require('pdfkit');
const { print } = require('pdf-to-printer');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// เปิดให้รับข้อมูลในรูปแบบ JSON
app.use(express.json());


function createqueue(data) {

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            size: [227, 227] ,
            margins : { top: 0, bottom: 0, left: 10, right: 10 }
        }); // กำหนดขนาดเป็น A4
        const outputPath = './assets/report/output.pdf';
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        doc.registerFont('normal', './assets/font/THSarabunNew.ttf');
        doc.registerFont('Bold', './assets/font/THSarabunNew Bold.ttf');
        doc.font('normal');
        // เขียนข้อความลงใน PDF
        doc.lineGap(0);


        data.forEach((val,i) => {

            let datethai = new Date(val.vstdate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
           
            doc.font('Bold');
            doc.fontSize(15).text('โรงพยาบาลปัตตานี\nคิวรับยาที่',0,5,{align: 'center'});
            doc.fontSize(100).text(val.queue, 0,10, {align: 'center'});
            doc.fontSize(15).text(`วันที่ ${datethai}`,0,95,{align: 'center'});
            doc.fontSize(15).text(`HN: ${val.hn} ชื่อ-สกุล: ${val.fullname}`,0,110,{align: 'center'});
            doc.fontSize(15).text(`ห้องตรวจ/คลินิก: ${val.ward}`,0,125,{align: 'center'});

            if(i+1<data.length)doc.addPage();
            
        })

        // ปิดการเขียน PDF
        doc.end();

        writeStream.on('finish', () => {
            resolve(outputPath);
        });

        writeStream.on('error', err => {
            reject(err);
        });
    });
}

app.get('/printqueue', (req, res) => {
    
    try {

        createqueue(req.query.data).then((path)=>{
           print(path)
           .then(() => {
             res.status(200).json({message:'success'});
           })

       });

   } catch (error) {

       res.status(400).json(error);
   }

});


// กำหนด port ที่จะใช้งาน
const port = 3300;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
