import inquirer from "inquirer";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg"
import Jimp from "jimp";

function videoToGiff(filename, start, end) {
    try {

        // Slice video to specified length
        ffmpeg(filename)
            .setStartTime(start)
            .setDuration(end - start)
            .output('temp.mp4')
            .on('end', function() {

                // After video slicing, apply watermark overlay and convert to gif
                ffmpeg('temp.mp4')
                    .input('watermark.png')
                    .complexFilter('[0:v]fps=30,scale=-1:-1[video];[1:v]scale=iw/6:-1[watermark];[video][watermark]overlay=W-w-10:H-h-10')
                    .output('output.gif')
                    .on('end', function() {
                        console.log('GIF created and watermark applied successfully');

                        // clean up sliced video
                        fs.unlinkSync('temp.mp4');
                    })
                    .on('error', function(err) {
                        console.log('An error occurred: ' + err.message);
                        throw Error("Error in converting video to gif")
                    })
                    .run();
            })
            .run();
    } catch(err) {
        console.log(err);
        throw Error("Error in converting video to gif");
    }
}


    await inquirer.prompt([
        {type:"input",name:"filename",message:"insert filename",default:"sample.mp4",
            validate:(filename)=>{
                const file=fs.statSync(filename)

                return file.isFile() ? true : "file not found"
            }
        },
        {
            type:"input",
            name:"start",
            message:"start timestamp",
            default:21,
            validate: function(value) {
                return !isNaN(parseFloat(value)) ? true : 'Please enter a valid number';
            }
        },
        {
            type:"input",
            name:"end",
            message:"end timestamp",
            default:28,
            validate: function(value, answers) {
                if(isNaN(parseFloat(value))){
                    return 'Please enter a valid number';
                } else if(parseFloat(value) <= parseFloat(answers.start)){
                    return 'End timestamp must be greater than start timestamp';
                } else {
                    return true;
                }
            }
        }
    ]).then((data)=>{
        console.log("starting process .....\n")

        const {filename,start,end}=data;
        videoToGiff(filename,start,end)

    }).catch((err)=>{
        console.log("err in inquirer",err)
        throw Error("Error in inquirer")
    })






// Below code is omitted, as it creates statis gifs
async function applyWatermark(){
    try{
        // Read gif and watermark logo
        const gif=await Jimp.read('output.gif')
        const watermarkLogo=await Jimp.read("watermark.png").then(logo=>logo.resize(Jimp.AUTO, gif.bitmap.height / 10))

        // Calculate values to put in bottom right
        // X= image width - logo width, Y= image height - logo height
        const x = gif.bitmap.width - watermarkLogo.bitmap.width;
        const y = gif.bitmap.height - watermarkLogo.bitmap.height;

        // Apply watermak and store
        const markedGif=gif.composite(watermarkLogo,x,y,Jimp.BLEND_SOURCE_OVER)
        markedGif.write("markedGif.gif",()=>console.log("done"))

        // delete gif without watermak
        fs.unlinkSync('output.gif');
        
    }catch(err){
        console.log(err)
        throw Error("Error in applying watermark")
    }
}