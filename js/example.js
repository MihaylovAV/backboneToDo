function Animal(name) {
    this.name = name;

    this.getName = function() {
        return this.name;
    }
}

var dog = new Animal('Мяу');

dog.gav = function() {
    return 'Dog ' + this.name + ' is saying gav';
};