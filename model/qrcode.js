import { getCurrentDate } from "../utils/date.js";
class QRCode {
    constructor(data,connection){
        this.user_id = data.user_id;
        this.qrcode = data.qrcode;
        this.insertQuery = 'INSERT INTO qrcode ("userId", qrcode,scanned_at) VALUES($1,$2,$3);';
        this.connection = connection;
    }

    async insertScanned(){
        console.log(this.user_id);
        await this.connection.query(this.insertQuery,[this.user_id,this.qrcode,getCurrentDate().toDate()]);
    }
}



export default QRCode;