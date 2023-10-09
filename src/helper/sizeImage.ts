import sharp from 'sharp';

export const reSizeImage = async (blob:any,width: number,height: number) =>{
    const comparessedImage = sharp(blob).resize({
        width: width,
        height: height
}).toBuffer();
    return comparessedImage;
}

export const nonReSizeImage = async (blob:any) =>{
    const comparessedImage = sharp(blob).resize().toBuffer();
    return comparessedImage;
}