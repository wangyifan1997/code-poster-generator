const sharp = require('sharp');
const fs = require('fs');
const { create } = require('xmlbuilder2');

const ratio = 1.6667;
let step, width, height, pixels, code, result;


// console.log("code: ", code);
// console.log("length: ", code.length);

sharp('./data/test1.png')
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then((data) => {
        step = data.info.channels;        
        width = data.info.width;
        height = data.info.height;

        pixels = [];

        for (let i = 0; i < data.data.length; i += step) {
            let temp = [];
            for (let j = 0; j < step; j++) {
                temp.push(data.data[i + j]);
            }
            pixels.push(temp);
        }

        code = fs.readFileSync('./data/QueryValidator.ts', 'utf8').replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ');
        console.log(code);
        console.log(pixels.length);
        console.log(code.length);
        if (code.length < pixels.length) {
            code = code.repeat(Math.ceil(pixels.length / code.length));
        }
        console.log(code.length);
        
        isSameColor = (c1, c2) => {
            return (c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2]);
        } 

        result = '';

        result += `<svg version="1.1"
                        viewBox="0 0 ${100 * width / ratio} ${100 * height}"
                        width="${100 * width / ratio}" height="${100 * height}"
                        xml:space="preserve"
                        style="font-family: 'Source Code Pro'; font-size: 1px; font-weight: 900; white-space: normal;"
                        xmlns="http://www.w3.org/2000/svg">`;




        for (let i = 0; i < height; i++) {
            let lastPixel = [0, 0, 0];
            for (let j = 0; j < width; j++) {
                let pixel = pixels[i * width + j];
                // console.log(i * width + j);
                // console.log("pixel: ", pixel);
                let char = code[i * width + j];

                switch (char) {
                    case '"':
                        char = '&quot;';
                        break;
                    case '\'':
                        char = '&apos;';
                        break;
                    case '<':
                        char = '&lt;';
                        break;
                    case '>':
                        char = '&gt;';
                        break;
                    case '&':
                        char = '&amp;';
                        break;
                    default:
                        break;
                }
                if (j === 0) {
                    result += `<text x="${j}" y="${i}" fill="rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})">${char}`;
                    lastPixel = pixel;
                } else if (j === width - 1) {
                    if (isSameColor(lastPixel, pixel)) {
                        result += `${char}</text>`;
                    } else {
                        result += `<text x="${j}" y="${i}" fill="rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})">${char}</text>`;
                    }
                } else {
                    if (isSameColor(lastPixel, pixel)) {
                        result += char;
                    } else {
                        result += `</text><text x="${j}" y="${i}" fill="rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})">${char}`;
                        lastPixel = pixel;
                    }
                }
            }
        }

        result += "</svg>";

        const doc = create(result).toString({prettyPrint: true});
        
        fs.open('./data/output.xml', 'w', (err, fd) => {
            if (err) {
                throw(err);
            }
            fs.writeFileSync(fd, doc);
        })
    }).catch((err) => {
        console.log("error:", err.message);
    });
