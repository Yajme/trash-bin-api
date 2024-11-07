class User {
    constructor(id,name, email, password){
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    getFullName(){
        return `${this.name.first} ${this.name.last}`;
    }

    static createWithObject(user){
        return new User(user.id,user.name,user.email,user.password);
    }
}