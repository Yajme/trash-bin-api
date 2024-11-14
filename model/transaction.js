import { formatDate } from "../utils/date.js";


class Transaction {
    constructor({ id = 0, type = "", reference_id = "", amount = 0, balance = 0, description = "", created_at = new Date() }) {
        this.id = id;
        this.type = type;
        this.reference_id = reference_id;
        this.amount = Number(amount);
        this.balance = Number(balance);
        this.description = description;
        this.created_at = created_at;
    }

    static createFromObject(transaction) {
        const date = new Date(transaction.created_at) instanceof Date ? new Date(transaction.created_at) : formatDate(transaction.created_at.seconds, transaction.created_at.nanoseconds);

        return new Transaction({
            id: transaction.id,
            type: transaction.type,
            reference_id: transaction.reference_id,
            amount: transaction.amount,
            balance: transaction.balance,
            description: transaction.description,
            created_at: date
        }); 
    }

    static createForInsert(transaction){
        const date = new Date(transaction.created_at) instanceof Date ? new Date(transaction.created_at) : formatDate(transaction.created_at.seconds, transaction.created_at.nanoseconds);

        return new Transaction({
            type: transaction.type,
            reference_id: transaction.reference_id,
            amount: transaction.amount,
            balance: transaction.balance,
            description: transaction.description,
            created_at: date
        }); 
    }
}


class Transactions {

    constructor(transaction) {

        this.transaction = transaction;
        this.insertQuery = 'INSERT INTO cash_ledger (type,reference_id,amount,balance,description,created_at) VALUES ($1,$2,$3,$4,$5,$6);';
    }

   async createTransaction(transaction, connection){
        const {type,reference_id,amount,balance,description,created_at} = transaction;
        await connection.query(this.insertQuery,[
            type,reference_id,amount,balance,description,created_at
        ]);
        
    }
}

export {
    Transaction,
    Transactions
}