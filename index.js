
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
            size: [80 * 2.834645669, 80 * 2.834645669], // Convert mm to points
            margins : { top: 0, bottom: 0, left: 0, right: 0 }
        }); // กำหนดขนาดเป็น A4
        const outputPath = './assets/report/output.pdf';
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        doc.registerFont('normal', './assets/font/THSarabunNew.ttf');
        doc.registerFont('Bold', './assets/font/THSarabunNew Bold.ttf');
        doc.font('normal');
        // เขียนข้อความลงใน PDF
        doc.lineGap(0);

        let main_dep_fasttrack = ['034','039','062','068','081','087','142','152','238','239','240','316','409','501'];

        data.forEach((val,i) => {
           
            let datethai = new Date(val.vstdate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            doc.font('Bold');
            doc.fontSize(15).text('โรงพยาบาลปัตตานี',0,5,{align: 'center'});
            doc.fontSize(25).text(`คิวรับยา${val.med_count <= 2 || main_dep_fasttrack.includes(val.main_dep)?'ด่วนช่อง 5 ':'ช่อง 6,7,8'}`,0,25,{align: 'center'});
            doc.fontSize(100).text(val.queue, 0,25, {align: 'center'});
            doc.fontSize(15).text(`จำนวนยา:        รายการ` ,0,110,{align: 'center'});
            doc.fontSize(20).text(val.med_count ,105,107,{align: 'center',width:10 * 2.834645669});
            doc.fontSize(15).text(`วันที่ ${datethai}`,0,125,{align: 'center'});
            doc.fontSize(15).text(`HN: ${val.hn} ชื่อ-สกุล: ${val.fullname}`,0,140,{align: 'center'});
            doc.fontSize(15).text(`ห้องตรวจ/คลินิก: ${val.ward}`,0,155,{align: 'center'});

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
        //    print(path)
        //    .then(() => {
             res.status(200).json({message:'success'});
        //    })

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
