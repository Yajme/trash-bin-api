class User {
    constructor(name, email, password){
        this.name = name;
        this.email = email;
        this.password = password;
    }

    getFullName(){
        return `${this.name.first} ${this.name.last}`;
    }
}