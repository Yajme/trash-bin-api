import {formatDate} from '../utils/date.js';

class Waste{
    constructor(category,points,weight,created_at,user_id){
        this.category = category;
        this.points = Number(points);
        this.weight = Number(weight);
        this.created_at = created_at;
        this.user_id = user_id;
    }

    static createWithObject(waste){
        const date = formatDate(waste.created_at.seconds,waste.created_at.nanoseconds);
        return new Waste(
            waste.category,
            waste.points,
            waste.weight,
            date,
            waste.user_id
        );
    }

    
    
}


export {Waste}