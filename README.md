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

## How to use
1. Register new account via registration form
2. Login to the site
3. Generate a pair of RSA keys
  1. It can be generated in LINUX via openssl package: 
  ```
  openssl genrsa -out priv.pem 1024
  openssl rsa -pubout -in priv.pem -out pub.pem
  ```
  2. Or just go to http://travistidwell.com/jsencrypt/demo/ and generate it online
4. Enter and save it in you profile tab
5. Go to "Contacts" tab, enter your friend's username (you should also send your username to your friend by alternative channel)
6. If it was successfully added, click on nickname in contact-list
7. You will be moved to "Messages" tab
8. Enter your friend's public RSA key which was sent to you by alternative ways 
9. And send her your public RSA key
10. If you wish to send your messages securely, check the checkbox "Encrypted" (You should set up keys first)
