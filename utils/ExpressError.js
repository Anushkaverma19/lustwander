class expresserror extends Error {
    constructor(statusCode, message) {
        super(message); // important
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = expresserror;