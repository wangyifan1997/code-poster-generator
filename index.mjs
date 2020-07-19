import sharp from 'sharp';

sharp('./data/test.png')
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then((data, info) => {
        console.log("data: ", data);
        console.log("info: ", info);
    }).catch((err) => {
        console.log("error: ", err.message);
    });

