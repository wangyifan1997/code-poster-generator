const sharp = require('sharp');
const fs = require('fs');

const FONT_SIZE = 5;
const FONT_RATIO = 0.6;
const FONT_WIDTH = FONT_SIZE * FONT_RATIO;

const imageDir = './data/hbd.png';
const codeDir = './data/p2p.go';
const outputDir = './data/hbdOutput.xml';

sharp(imageDir)
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then((data) => {
        const step = data.info.channels;
        const width = data.info.width;
        const height = data.info.height;

        const pixels = [];
        for (let i = 0; i < data.data.length; i += step) {
            pixels.push(data.data.slice(i, i + step));
        }

        let code = fs.readFileSync(codeDir, 'utf8').replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ');

        if (code.length < pixels.length) {
            code = code.repeat(Math.ceil(pixels.length / code.length));
        }

        const isSameColor = (c1, c2) => {
            return (c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2]);
        }

        let result = '';
        result += `<svg version="1.1"
                        viewBox="0 0 ${100 * width} ${100 * height}"
                        width="${100 * width}" height="${100 * height}"
                        xml:space="preserve"
                        style="font-family: 'Source Code Pro'; font-size: ${FONT_SIZE}px; font-weight: 500; white-space: normal;"
                        xmlns="http://www.w3.org/2000/svg">`;

        for (let i = 0; i < height; i++) {
            let lastPixel;
            for (let j = 0; j < width; j++) {
                let pixel = pixels[i * width + j];
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
                    result += `<text x="${j * FONT_WIDTH}" y="${i * FONT_SIZE}"  fill="rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})">${char}`;
                    lastPixel = pixel;
                } else if (j === width - 1) {
                    result += isSameColor(lastPixel, pixel) ? 
                                `${char}</text>` : 
                                `</text><text x="${j * FONT_WIDTH}" y="${i * FONT_SIZE}"  fill="rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})">${char}</text>`;
                } else {
                    if (isSameColor(lastPixel, pixel)) {
                        result += char;
                    } else {
                        result += `</text><text x="${j * FONT_WIDTH}" y="${i * FONT_SIZE}"  fill="rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})">${char}`;
                        lastPixel = pixel;
                    }
                }
            }
        }
        
        result += "</svg>";

        fs.open(outputDir, 'w', (err, fd) => {
            if (err) {
                throw (err);
            }
            fs.writeFileSync(fd, result);
        })
    }).catch((err) => {
        console.log("error:", err.message);
    });

