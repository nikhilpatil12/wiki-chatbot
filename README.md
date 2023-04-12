# Wiki Chatbot
### Simple Chatbot using NLTK and Wikipedia API:
This chatbot is built using a combination of several technologies to create a robust and interactive user experience. Beautiful Soup is used for web scraping and data extraction, Flask is the web framework used to build the backend of the chatbot, while Python provides the core functionality for data processing and manipulation.

* Beautiful Soup: A Python library for web scraping and data extraction.
* Flask: A lightweight web framework used to build the backend of the chatbot.
* Python: The programming language that provides the core functionality for data processing and manipulation.
* Angular: A popular framework for building dynamic web applications, used to provide seamless interactivity between the frontend and backend.
* MongoDB: A NoSQL database used to store and manage user data and chat histories.

---
## Getting Started

### Dependencies

* MongoDB
* Python 3.10
* Node.js
* Angular

### Executing program

1. Clone this repository
```bash
git clone https://github.com/nikhilpatil12/wiki-chatbot
```
2. cd into the downloded sourcecode
```bash
cd wiki-chatbot
```
3. Install python requirements
```bash
pip install -r py-requirements.txt
```
4. Install en_core_web_sm model
```bash 
python -m spacy download en_core_web_sm
```
5. Execute "gunicorn wsgi:app" to run the backend server
```bash
gunicorn wsgi:app
```
6. Change directory to chatbot-ui:
```bash
cd chatbot-ui
```
7. Run the following command to install the dependencies listed in the package.json file
```bash
npm install
```
8. Once the installation is complete, run the following command to build the Angular app, Make sure you have Angular cli installed
```
ng serve -o
```
9. Use your server to run the web app


## Built With
[![Angular][Angular-logo]][Angular-url]
[![Python][Python-logo]][Python-url]
[![Flask][Flask-logo]][Flask-url]
[![Mongo][Mongo-logo]][Mongo-url]

## Authors
* Nikhil Patil
* [@nikhilpatil12](https://www.linkedin.com/in/nikhilpatil12/)

## Version History
* 0.1
    * Initial Release


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Angular-logo]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Python-logo]: https://img.shields.io/badge/Python-0066FF?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[Flask-logo]: https://img.shields.io/badge/Flask-000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/en/2.2.x/
[Mongo-logo]: https://img.shields.io/badge/MongoDB-009933?style=for-the-badge&logo=mongodb&logoColor=white
[Mongo-url]: https://www.mongodb.com/
