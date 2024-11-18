import {formatDate} from '../utils/date.js';

class Waste{
    constructor(category,points,weight,created_at,user_id,name){
        this.category = category;
        this.points = Number(points);
        this.weight = Number(weight);
        this.created_at = created_at;
        this.user_id = user_id;
        this.name = name;
    }

    static createWithObject(waste){
        const date = formatDate(waste.created_at.seconds,waste.created_at.nanoseconds);
        const name = {
            first: waste.user.first_name,
            last: waste.user.last_name
        }
        return new Waste(
            waste.category,
            waste.points,
            waste.weight,
            date,
            waste.user_id,
            name
        );
    }

    getFullName(){
        return `${this.name.first} ${this.name.last}`;
    }
    
}


export {Waste}