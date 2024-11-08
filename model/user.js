class User {
    constructor(id,name, username, password){
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
    }

    getFullName(){
        return `${this.name.first} ${this.name.last}`;
    }

    static createWithObject(user){
        return new User(user.id,user.name,user.username,user.password);
    }
}