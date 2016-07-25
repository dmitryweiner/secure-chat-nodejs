# Secure chat
Secure chat with RSA and AES end to end encryption 

##Technologies used:
### Backend:
* [Node.js 4.4](https://nodejs.org/en/download/)
* Express.js
* Mongoose.js (MongoDB)

### Frontend:
* Bootstrap CSS
* Jade
* JQuery
* [jsencrypt](https://github.com/travist/jsencrypt) -- RSA encryption/decryption
* [CryptoJS](https://cdnjs.com/libraries/crypto-js) -- AES encryption/decryption

## Installation:
* Install mongodb locally
* Change connection string in config.js according to DB setting
* Install Node.js modules
```
sudo npm i
```

## How to run Node.js server for debug purposes:
```
npm start
```
Then go to:
http://127.0.0.1:3000/
