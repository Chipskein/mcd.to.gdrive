const fs=require('fs');
const path=require('path');
const hash=require('sha256');


const LogService = require('./logservice');

const defaultPath=`${path.resolve()}/src/tmp/`;

const FileService={
    loadEnviroment:(envfile_name='.env')=>{
        const dotenv=require('dotenv');
        dotenv.config(envfile_name);
    },
    testEnvVariables:()=>{
        const { CREDENTIALS_JSON, GDRIVE_FOLDER ,MCD_DIR }=process.env
        if(CREDENTIALS_JSON && GDRIVE_FOLDER && MCD_DIR){
            try{
                test1=JSON.parse(CREDENTIALS_JSON);
                test2=fs.existsSync(MCD_DIR)
                return test1&&test2 ? true:false
            }
            catch (e){
                LogService.error(e);
                return false;
            }
        } else return false;
    },
    prepareGDRIVEVariables:()=>{
        FileService.createFile('tmpcredentials.json',process.env.CREDENTIALS_JSON)
        contentFromCreatedFile=FileService.readFile(defaultPath+'tmpcredentials.json');
        if(contentFromCreatedFile==process.env.CREDENTIALS_JSON) return true;
        else false;
    },
    readFileBuffer:(filepath)=>{
        const fileBuffer=fs.readFileSync(filepath);
        return fileBuffer;
    },
    readFile:(filepath)=>{
        const fileBuffer=fs.readFileSync(filepath);
        const fileContent=fileBuffer.toString('utf-8');
        return fileContent;
    },
    testReadFile:()=>{
        const fileContent=FileService.readFile(path.resolve()+'/src/tmp/.gitkeep');
        return (fileContent=='temp dir') ? true:false; 
    },
    createWriteStream:(filename)=>{
        return fs.createWriteStream(defaultPath+filename);
    },
    createReadStreamFromFile:(path)=>{
        return fs.createReadStream(path);
    },
    createFile:(filename,content)=>{
        fs.writeFileSync(defaultPath+filename,content)
    },
    deleteFile:(filename)=>{
        const path=defaultPath+filename;
        const exists=fs.existsSync(path)
        if(exists) fs.unlinkSync(path);
        return exists
    },
    readAllFromMCD_DIR:()=>{
        const MCD_DIR=process.env.MCD_DIR;
        const files=fs.readdirSync(MCD_DIR);
        const response=[];
        for (let filename of files) {
            const extension = path.extname(MCD_DIR+filename);
            const stats=fs.statSync(MCD_DIR+filename);
            const updated_at=stats.mtime;
            const filesize = stats.size;
            const id=hash(filename);
            const description='duckstation memory card file'
            const filepath=MCD_DIR+filename;
            response.push({id,name: filename, extension,description,filesize,updated_at,filepath});
        }
        return response;
    },
    verifyIfFileExists:(fileId)=>{
        return fs.existsSync(defaultPath+fileId);
    },
    verifySyncFile:(fileId,realFileName)=>{
        
        let GdriveFilePath=defaultPath+fileId;
        let RealFilePath=process.env.MCD_DIR+realFileName;
        let GdriveFile_EQ_RealFile=FileService.CompareFilesBufferByPath(GdriveFilePath,RealFilePath)
        //
        if(!GdriveFile_EQ_RealFile){
            return false;
        }
        else{
            LogService.warning(`${fileId} has the same content that Gdrive file but dates differ`)
            return true;
        }
    },
    CompareFilesBufferByPath:(path1,path2)=>{
        //return true if files are equal e false if not
        const bufferOfGdriveFile=FileService.readFileBuffer(path1);
        const bufferOfRealFile=FileService.readFileBuffer(path2);
        //compare buffer size of both files if differ differ file
        if(bufferOfRealFile.length!=bufferOfGdriveFile.length) return false;
        else{
            const buffer_size=bufferOfRealFile.length
            for(let c=0;c<buffer_size;c++){
                byte1=bufferOfGdriveFile[c];
                byte2=bufferOfGdriveFile[c];
                if(byte1!=byte2) return false;
            }
            //are equal
            return true;
        }
    },
    clearTMP:()=>{
        const tmp_files=fs.readdirSync(defaultPath);
        for (filename of tmp_files){
            if(filename!='.gitkeep'){
                fs.unlinkSync(defaultPath+filename);
            }
        }
    }
}
module.exports=FileService