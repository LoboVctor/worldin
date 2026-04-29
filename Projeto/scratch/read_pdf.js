const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:\\Users\\Victor Lobo\\.gemini\\antigravity\\scratch\\worldin\\Documentação do Projeto - Worldin.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('c:\\Users\\Victor Lobo\\.gemini\\antigravity\\scratch\\worldin\\scratch\\pdf_text.txt', data.text);
    console.log('PDF text extracted successfully.');
}).catch(function(error){
    console.error('Error parsing PDF:', error);
});
